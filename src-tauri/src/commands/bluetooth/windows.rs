use std::{fmt::Display, os::windows::process::CommandExt, process::Command};

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
    },
};

use crate::utils::{json::merge_json_arrays_by_key, string_changer::string_to_u16_slice};

type SysBluetoothDeviceInfo = windows::Win32::Devices::Bluetooth::BLUETOOTH_DEVICE_INFO;
const CREATE_NO_WINDOW: u32 = 0x08000000;

pub fn get_bluetooth_info(instance_id: &str) -> Result<Value, serde_json::Error> {
    let output = Command::new("powershell.exe")
        .args([
            "-ExecutionPolicy",
            "ByPass",
            "-File",
            "./scripts/get-bluetooth-battery.ps1",
            "-InstanceId",
            instance_id,
        ])
        .creation_flags(CREATE_NO_WINDOW)
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
            "-File",
            "./scripts/get-bluetooth-battery-all.ps1",
        ])
        .creation_flags(CREATE_NO_WINDOW)
        .output()
        .expect("Failed to spawn powershell command");
    let json_str = String::from_utf8_lossy(&output.stdout);
    let battery_json_vec = match serde_json::from_str(json_str.trim()).unwrap() {
        Value::Array(battery_json_array) => battery_json_array,
        _ => panic!("Failed to parse battery"),
    };

    let devices = get_bluetooth_device_info().expect("Failed to get bluetooth device");
    let devices_info_vec = devices
        .iter()
        .map(|device| serde_json::to_value(device).unwrap())
        .collect::<Vec<Value>>();

    let merged_json_array = merge_json_arrays_by_key(
        battery_json_vec.as_slice(),
        devices_info_vec.as_slice(),
        "bluetooth_address",
    );
    serde_json::to_value(merged_json_array)
}

#[derive(Clone, Debug)]
/// wrapped windows crate structure to implement Display and Debug traits.
///
/// See: https://learn.microsoft.com/windows/win32/api/bluetoothapis/ns-bluetoothapis-bluetooth_device_info_struct
pub struct BluetoothDeviceInfo {
    class_of_device: u32,
    bluetooth_address: BluetoothAddress,
    is_connected: bool,
    is_remembered: bool,
    is_authenticated: bool,
    last_seen: SystemTime,
    last_used: SystemTime,
    name: String,
}

impl Serialize for BluetoothDeviceInfo {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        let mut state = serializer.serialize_struct("BluetoothDeviceInfo", 8)?;
        state.serialize_field("class_of_device", &self.parse_class_of_device())?;
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

impl BluetoothDeviceInfo {
    /// This code is converted from C++.
    /// See: https://github.com/joric/bluetooth-battery-monitor/blob/master/misc/bt_classic_test.cpp#L6
    fn parse_class_of_device(&self) -> String {
        let cod = self.class_of_device as usize;
        let major = (cod >> 8) & 0x1f;
        let minor = (cod >> 2) & 0x3f;
        let cc = [
            "Miscellaneous",
            "Computer",
            "Phone",
            "LAN/Network Access Point",
            "Audio/Video",
            "Peripheral",
            "Imaging",
            "Wearable",
            "Toy",
            "Health",
        ];
        let cc_count = cc.len();
        let cat = if major < cc_count {
            cc[major]
        } else {
            "Unknown"
        };
        let sub = match major {
            4 => {
                let cc4 = [
                    "Uncategorized",
                    "Wearable Headset Device",
                    "Hands-free Device",
                    "(Reserved)",
                    "Microphone",
                    "Loudspeaker",
                    "Headphones",
                    "Portable Audio",
                    "Car audio",
                    "Set-top box",
                    "HiFi Audio Device",
                    "VCR",
                    "Video Camera",
                    "Camcorder",
                    "Video Monitor",
                    "Video Display and Loudspeaker",
                    "Video Conferencing",
                    "(Reserved)",
                    "Gaming/Toy",
                ];
                Some(cc4[minor])
            }
            5 => {
                let cc5 = ["Unknown", "Keyboard", "Mouse", "Keyboard/Mouse Combo"];
                Some(cc5[(minor >> 4)])
            }
            _ => None,
        };
        if let Some(sub_class) = sub {
            format!("{}: {}", cat, sub_class)
        } else {
            cat.to_owned()
        }
    }
}

impl From<SysBluetoothDeviceInfo> for BluetoothDeviceInfo {
    fn from(device_info: SysBluetoothDeviceInfo) -> Self {
        BluetoothDeviceInfo {
            bluetooth_address: BluetoothAddress(unsafe { device_info.Address.Anonymous.ullLong }),
            class_of_device: device_info.ulClassofDevice,
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
                    ullLong: device_info.bluetooth_address.0,
                },
            },
            ulClassofDevice: device_info.class_of_device,
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

/// Network byte order(Big endian) u64
#[derive(Copy, Clone, Debug)]
struct BluetoothAddress(u64);

impl BluetoothAddress {
    /// Convert from big endian address to hex string representation.
    ///
    /// e.g.    BigEndian: [0xcc, 0xbb, 0xaa, 0x22, 0x11, 0x00] => "001122aabbcc"
    /// e.g. LittleEndian: [0xcc, 0xbb, 0xaa, 0x22, 0x11, 0x00] => "ccbbaa221100"
    pub fn as_hex_string(&self) -> String {
        self.as_hex_string_with_colon(ByteOrder::BigEndian)
            .replace(':', "")
    }

    /// Convert from big endian address to hex string with colon representation.
    ///
    /// e.g. [0xcc, 0xbb, 0xaa, 0x22, 0x11, 0x00] => "00:11:22:aa:bb:cc"
    pub fn as_hex_string_with_colon(&self, byte_order: ByteOrder) -> String {
        let rg_bytes: [u8; 6] = (*self).into();
        match byte_order {
            ByteOrder::BigEndian => format!(
                "{:02x}:{:02x}:{:02x}:{:02x}:{:02x}:{:02x}",
                rg_bytes[0], rg_bytes[1], rg_bytes[2], rg_bytes[3], rg_bytes[4], rg_bytes[5],
            ),
            ByteOrder::LittleEndian => format!(
                "{:02x}:{:02x}:{:02x}:{:02x}:{:02x}:{:02x}",
                rg_bytes[5], rg_bytes[4], rg_bytes[3], rg_bytes[2], rg_bytes[1], rg_bytes[0],
            ),
        }
    }
}

enum ByteOrder {
    BigEndian,
    LittleEndian,
}

impl Display for BluetoothAddress {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(
            f,
            "{}",
            self.as_hex_string_with_colon(ByteOrder::LittleEndian)
        )
    }
}

impl From<[u8; 6]> for BluetoothAddress {
    fn from(slice: [u8; 6]) -> Self {
        let mut result: u64 = 0;
        for (i, byte) in slice.iter().enumerate() {
            result |= (u64::from(*byte)) << ((5 - i) * 8);
        }
        Self(result)
    }
}

impl From<BluetoothAddress> for [u8; 6] {
    fn from(address: BluetoothAddress) -> Self {
        let mut result = [0u8; 6];
        for i in 0..6 {
            result[5 - i] = ((address.0 >> (i * 8)) & 0xFF) as u8;
        }
        result
    }
}

#[derive(Clone, Debug, Serialize, Deserialize)]
struct SystemTime {
    year: u16,
    month: u16,
    day_of_week: u16,
    day: u16,
    hour: u16,
    minute: u16,
    second: u16,
    milliseconds: u16,
}

pub fn get_bluetooth_device_info() -> Result<Vec<BluetoothDeviceInfo>> {
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

#[cfg(test)]
mod tests {
    use std::{fs::File, io::Write};

    use crate::commands::bluetooth::sys::get_bluetooth_info_all;

    #[test]
    fn print_bluetooth_devices() {
        let devices_info = get_bluetooth_info_all().unwrap();
        println!("{}", devices_info);
        let mut file = File::create("devices.json").unwrap();
        file.write_all(devices_info.to_string().as_bytes()).unwrap();
    }
}
