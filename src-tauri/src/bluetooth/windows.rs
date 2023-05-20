use std::{os::windows::process::CommandExt, process::Command};

use anyhow::Result;
use serde::{ser::SerializeStruct, Deserialize, Serialize};
use serde_json::Value;
use windows::{
    imp::CloseHandle,
    Win32::{
        Devices::Bluetooth::{
            BluetoothFindFirstDevice, BluetoothFindNextDevice, BluetoothGetDeviceInfo,
            BLUETOOTH_DEVICE_SEARCH_PARAMS,
        },
        Foundation::{FALSE, HANDLE, SYSTEMTIME, TRUE},
        System::Threading::CREATE_NO_WINDOW,
    },
};

use crate::bluetooth::common::{BluetoothAddress, BluetoothClass, SystemTime};
use crate::utils::{json::merge_json_arrays_by_key, string_changer::string_to_u16_slice};

type SysBluetoothDeviceInfo = windows::Win32::Devices::Bluetooth::BLUETOOTH_DEVICE_INFO;

pub fn get_bluetooth_info(instance_id: &str) -> Result<Value, serde_json::Error> {
    let script_str = &format!(
        "\n$InstanceId = \"{}\";{}",
        instance_id,
        include_str!("../../scripts/get-bluetooth-battery.ps1")
    );

    debug!("{}", script_str);

    let output = Command::new("powershell.exe")
        .args(["-ExecutionPolicy", "ByPass", "-Command", script_str])
        .creation_flags(CREATE_NO_WINDOW.0)
        .output()
        .expect("Failed to spawn powershell command");
    let result = String::from_utf8_lossy(&output.stdout);
    serde_json::from_str(result.trim())
}

#[derive(Serialize, Deserialize)]
struct PnpDevice {
    instance_id: String,
    friendly_name: String,
    /// e.g. 80
    battery_level: u8,
    /// e.g. "00112233aabb"
    bluetooth_address: String,
}

pub fn get_bluetooth_info_all() -> Result<Value, serde_json::Error> {
    let output = Command::new("powershell.exe")
        .args([
            "-ExecutionPolicy",
            "ByPass",
            "-Command",
            include_str!("../../scripts/get-bluetooth-battery-all.ps1"),
        ])
        .creation_flags(CREATE_NO_WINDOW.0)
        .output()
        .expect("Failed to spawn powershell command");
    let json_str = String::from_utf8_lossy(&output.stdout);
    let external_devices_info = match serde_json::from_str(json_str.trim())? {
        Value::Array(json_array) => json_array,
        _ => panic!("Failed to parse battery"),
    };

    let devices = get_bluetooth_devices_info().expect("Failed to get bluetooth device");
    let devices_info = devices
        .iter()
        .map(|device| serde_json::to_value(device).unwrap())
        .collect::<Vec<Value>>();

    let merged_json_array = merge_json_arrays_by_key(
        external_devices_info.as_slice(),
        devices_info.as_slice(),
        "bluetooth_address",
    );
    serde_json::to_value(merged_json_array)
}

pub fn get_bluetooth_devices_info() -> Result<Vec<BluetoothDeviceInfo>> {
    // See: https://learn.microsoft.com/windows/win32/api/bluetoothapis/ns-bluetoothapis-bluetooth_device_search_params
    let search_params: BLUETOOTH_DEVICE_SEARCH_PARAMS = BLUETOOTH_DEVICE_SEARCH_PARAMS {
        // size of the structure (in bytes).
        dwSize: std::mem::size_of::<BLUETOOTH_DEVICE_SEARCH_PARAMS>() as u32,
        // A value indicating that an authenticated Bluetooth device must be returned in the search.
        fReturnAuthenticated: FALSE,
        // value indicating that a remembered Bluetooth device must be returned in the search.
        fReturnRemembered: TRUE,
        // value that specifies that the search should return an unknown Bluetooth device.
        fReturnUnknown: TRUE,
        /// a value indicating that the search must return connected Bluetooth devices.
        fReturnConnected: FALSE,
        /// a value indicating that a new inquiry needs to be issued.
        fIssueInquiry: TRUE,
        /// A value indicating the inquiry timeout, expressed in 1.28 second increments.
        /// For example, the cTimeoutMultiplier value for a 12.8 second inquiry is 10.
        /// The maximum value for this member is 48. If a value greater than 48 is used,
        /// the calling function will fail immediately and return E_INVALIDARG.
        cTimeoutMultiplier: 2,
        /// Handle to the radio to perform the query. Set to NULL to perform the query on all local Bluetooth radios.
        hRadio: HANDLE(0),
    };

    let mut device_info = SysBluetoothDeviceInfo {
        dwSize: std::mem::size_of::<SysBluetoothDeviceInfo>() as u32,
        ..Default::default()
    };

    let search_handle = match unsafe { BluetoothFindFirstDevice(&search_params, &mut device_info) }
    {
        Ok(search_handle) => match search_handle.is_invalid() {
            true => return Err(windows::core::Error::from_win32().into()),
            false => search_handle,
        },
        Err(_) => panic!("Couldn't get first device."),
    };

    let mut res: Vec<BluetoothDeviceInfo> = Vec::new();
    loop {
        match unsafe { BluetoothGetDeviceInfo(HANDLE(search_handle.0), &mut device_info) } {
            result if result != 0 => {
                error!("Error code: {}", result);
                break;
            }
            result => result,
        };

        res.push(device_info.into());

        if unsafe { !BluetoothFindNextDevice(search_handle, &mut device_info).as_bool() } {
            break;
        }
    }
    unsafe { CloseHandle(search_handle.0) }; //  End of Bluetooth device search

    Ok(res)
}

#[derive(Clone, Debug)]
/// wrapped windows crate structure to implement Display and Debug traits.
///
/// See: https://learn.microsoft.com/windows/win32/api/bluetoothapis/ns-bluetoothapis-bluetooth_device_info_struct
pub struct BluetoothDeviceInfo {
    pub class_of_device: BluetoothClass,
    pub bluetooth_address: BluetoothAddress,
    pub is_connected: bool,
    pub is_remembered: bool,
    pub is_authenticated: bool,
    pub last_seen: SystemTime,
    pub last_used: SystemTime,
    pub name: String,
}

impl Serialize for BluetoothDeviceInfo {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        let mut state = serializer.serialize_struct("BluetoothDeviceInfo", 8)?;
        state.serialize_field("class_of_device", &self.class_of_device.to_string())?;
        state.serialize_field(
            "bluetooth_address",
            &self.bluetooth_address.as_hex_string().to_uppercase(),
        )?;
        state.serialize_field("is_connected", &self.is_connected)?;
        state.serialize_field("is_remembered", &self.is_remembered)?;
        state.serialize_field("is_authenticated", &self.is_authenticated)?;
        state.serialize_field("last_seen", &self.last_seen)?;
        state.serialize_field("last_used", &self.last_used)?;
        state.serialize_field("device_name", &self.name)?;
        state.end()
    }
}

impl From<SysBluetoothDeviceInfo> for BluetoothDeviceInfo {
    fn from(device_info: SysBluetoothDeviceInfo) -> Self {
        BluetoothDeviceInfo {
            bluetooth_address: BluetoothAddress::from(unsafe {
                device_info.Address.Anonymous.ullLong
            }),
            class_of_device: BluetoothClass::from(device_info.ulClassofDevice),
            is_connected: device_info.fConnected.as_bool(),
            is_remembered: device_info.fRemembered.as_bool(),
            is_authenticated: device_info.fAuthenticated.as_bool(),
            last_seen: SystemTime {
                year: device_info.stLastSeen.wYear,
                month: device_info.stLastSeen.wMonth,
                day_of_week: device_info.stLastSeen.wDayOfWeek,
                day: device_info.stLastSeen.wDay,
                hour: device_info.stLastSeen.wHour,
                minute: device_info.stLastSeen.wMinute,
                second: device_info.stLastSeen.wSecond,
                milliseconds: device_info.stLastSeen.wMilliseconds,
            },
            last_used: SystemTime {
                year: device_info.stLastUsed.wYear,
                month: device_info.stLastUsed.wMonth,
                day_of_week: device_info.stLastUsed.wDayOfWeek,
                day: device_info.stLastUsed.wDay,
                hour: device_info.stLastUsed.wHour,
                minute: device_info.stLastUsed.wMinute,
                second: device_info.stLastUsed.wSecond,
                milliseconds: device_info.stLastUsed.wMilliseconds,
            },
            name: String::from_utf16_lossy(&device_info.szName).replace('\0', ""),
        }
    }
}

impl From<BluetoothDeviceInfo> for SysBluetoothDeviceInfo {
    fn from(device_info: BluetoothDeviceInfo) -> Self {
        SysBluetoothDeviceInfo {
            dwSize: std::mem::size_of::<SysBluetoothDeviceInfo>() as u32,
            Address: windows::Win32::Devices::Bluetooth::BLUETOOTH_ADDRESS {
                Anonymous: windows::Win32::Devices::Bluetooth::BLUETOOTH_ADDRESS_0 {
                    ullLong: device_info.bluetooth_address.into(),
                },
            },
            ulClassofDevice: device_info.class_of_device.into(),
            fConnected: device_info.is_connected.into(),
            fRemembered: device_info.is_remembered.into(),
            fAuthenticated: device_info.is_authenticated.into(),
            stLastSeen: SYSTEMTIME {
                wYear: device_info.last_seen.year,
                wMonth: device_info.last_seen.month,
                wDayOfWeek: device_info.last_seen.day_of_week,
                wDay: device_info.last_seen.day,
                wHour: device_info.last_seen.hour,
                wMinute: device_info.last_seen.minute,
                wSecond: device_info.last_seen.second,
                wMilliseconds: device_info.last_seen.milliseconds,
            },
            stLastUsed: SYSTEMTIME {
                wYear: device_info.last_used.year,
                wMonth: device_info.last_used.month,
                wDayOfWeek: device_info.last_used.day_of_week,
                wDay: device_info.last_used.day,
                wHour: device_info.last_used.hour,
                wMinute: device_info.last_used.minute,
                wSecond: device_info.last_used.second,
                wMilliseconds: device_info.last_used.milliseconds,
            },
            szName: string_to_u16_slice(&device_info.name),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::get_bluetooth_devices_info;

    #[test]
    fn test_get_devices_info() {
        let devices = get_bluetooth_devices_info().unwrap();
        println!("{:?}", devices);
    }
}
