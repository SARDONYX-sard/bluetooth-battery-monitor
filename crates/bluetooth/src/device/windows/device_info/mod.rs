// ref:
// - https://www.bluetoothgoodies.com/battery-monitor/faq/
// - https://stackoverflow.com/questions/71736070/how-to-get-bluetooth-device-battery-percentage-using-powershell-on-windows

mod buffer;
mod dev_prop;
mod device_instance;

use device_instance::DeviceInstance;
use snafu::Snafu;
use windows::{
    core::{h, Error, HRESULT, PCWSTR},
    Wdk::Devices::Bluetooth::{DEVPKEY_Bluetooth_ClassOfDevice, DEVPKEY_Bluetooth_DeviceAddress},
    Win32::{
        Devices::{
            DeviceAndDriverInstallation::{
                CM_Get_Device_ID_ListW, CM_Get_Device_ID_List_SizeW, CM_Locate_DevNodeW,
                CM_MapCrToWin32Err, CM_LOCATE_DEVNODE_NORMAL, CR_SUCCESS,
            },
            Properties::DEVPKEY_Device_FriendlyName,
        },
        Foundation::DEVPROPKEY,
    },
};

use crate::{
    categories::{category::Category, errors::CategoryError},
    device::device_info::{Devices, LocalTime},
    BluetoothDeviceInfo,
};

/// Apple's proprietary extension but battery information supported by most HFP profile devices
#[allow(non_upper_case_globals)]
const DEVPKEY_Bluetooth_Battery: DEVPROPKEY = DEVPROPKEY {
    fmtid: windows::core::GUID::from_u128(0x104ea319_6ee2_4701_bd47_8ddbf425bbe5),
    pid: 2,
};

/// Custom error type using snafu
#[derive(Debug, Snafu)]
pub enum BluetoothDeviceInfoError {
    /// Failed to get device list size.
    FailedToGetDeviceListSize,

    /// Failed to get device: {source}
    FailedToGetDevice { source: Error },

    /// Failed to retrieve device property {key:?}: {source}
    DevicePropertyError { key: DEVPROPKEY, source: Error },

    /// Could not get Bluetooth information from instance_id: {source}
    InvalidInstanceId { source: Error },

    /// Device address not found.
    DeviceAddressNotFound,

    #[snafu(transparent)]
    DevicePropertyTypeError { source: buffer::DevicePropertyError },

    #[snafu(transparent)]
    CategoryError { source: CategoryError },

    #[snafu(transparent)]
    #[cfg(target_os = "windows")]
    Error { source: windows::core::Error },
}

impl BluetoothDeviceInfo {
    fn from_instance_id(id: &[u16]) -> Result<Self, BluetoothDeviceInfoError> {
        let mut device = DeviceInstance::empty();
        let ret = unsafe {
            CM_Locate_DevNodeW(&mut device.0, PCWSTR(id.as_ptr()), CM_LOCATE_DEVNODE_NORMAL)
        };
        if ret != CR_SUCCESS {
            let error = unsafe { CM_MapCrToWin32Err(ret, 0) };
            let source = Error::from_hresult(HRESULT::from_win32(error));
            return Err(BluetoothDeviceInfoError::InvalidInstanceId { source });
        }

        let address = {
            let hex_address =
                device.get_device_property::<String>(&DEVPKEY_Bluetooth_DeviceAddress)?;
            u64::from_str_radix(&hex_address, 16)
                .map_err(|_| BluetoothDeviceInfoError::DeviceAddressNotFound)?
        };
        let category = {
            let bluetooth_class =
                device.get_device_property::<u32>(&DEVPKEY_Bluetooth_ClassOfDevice)?;
            Category::try_from(bluetooth_class)?
        };

        Ok(Self {
            instance_id: String::from_utf16_lossy(id),
            friendly_name: device.get_device_property(&DEVPKEY_Device_FriendlyName)?,
            battery_level: device.get_device_property(&DEVPKEY_Bluetooth_Battery)?,
            address,
            category,
            is_connected: false, // dummy(It can only be obtained by device_searcher.)
            last_used: LocalTime::default(), // dummy(It can only be obtained by device_searcher.)
            last_updated: LocalTime::now(),
            device_instance: device.0,
        })
    }

    /// Update information
    ///
    /// - battery_level
    /// - is_connected
    /// - last_used
    /// - last_updated
    pub(crate) fn update_info(&mut self) -> Result<(), BluetoothDeviceInfoError> {
        let device = DeviceInstance::new(self.device_instance);

        self.battery_level = device.get_device_property(&DEVPKEY_Bluetooth_Battery)?;
        self.last_updated = LocalTime::now();

        let sys_device = {
            let mut devices = match super::device_searcher::get_bluetooth_devices() {
                Ok(devices) => devices,
                Err(err) => {
                    tracing::error!("{err}");
                    return Ok(());
                }
            };
            devices.remove(&self.address)
        };

        // NOTE: `is_connected` & `last_used` must be taken by device_search to get a decent value, so the information is merged.
        self.is_connected = sys_device
            .as_ref()
            .map(|device| device.is_connected)
            .unwrap_or_default();
        self.last_used = sys_device
            .map(|device| device.last_used)
            .unwrap_or_default();

        Ok(())
    }
}

/// Gets the list of Bluetooth devices and their properties.
pub(crate) fn get_bluetooth_devices() -> Result<Devices, BluetoothDeviceInfoError> {
    let buffer = {
        let buffer_size = {
            let mut buffer_size: u32 = 0;
            let ret = unsafe { CM_Get_Device_ID_List_SizeW(&mut buffer_size, PCWSTR::null(), 0) };

            if ret == CR_SUCCESS {
                buffer_size
            } else {
                return Err(BluetoothDeviceInfoError::FailedToGetDeviceListSize);
            }
        };
        let mut buffer = vec![0_u16; buffer_size as usize];

        let ret = unsafe { CM_Get_Device_ID_ListW(PCWSTR::null(), &mut buffer, 0) };
        if ret != CR_SUCCESS {
            return Err(BluetoothDeviceInfoError::FailedToGetDevice {
                source: Error::from_win32(),
            });
        }

        buffer
    };

    let devices = {
        let filter = h!(r#"BTHENUM\{0000111e-0000-1000-8000-00805f9b34fb}_"#); // Instance ID prefix of bluetooth device with battery information.

        let mut sys_devices = super::device_searcher::get_bluetooth_devices()?;
        let devices = Devices::new();
        for id in buffer.split(|&c| c == 0).filter(|s| !s.is_empty()) {
            if !id.starts_with(filter) {
                continue;
            }

            let mut device_info = match BluetoothDeviceInfo::from_instance_id(id) {
                Ok(info) => info,
                Err(err) => {
                    tracing::error!("{err}");
                    continue;
                }
            };

            // NOTE: `is_connected` & `last_used` must be taken by device_search to get a decent value, so the information is merged.
            if let Some(sys_info) = sys_devices.remove(&device_info.address) {
                device_info.is_connected = sys_info.is_connected;
                device_info.last_used = sys_info.last_used;
            }

            devices.insert(device_info.address, device_info);
        }

        devices
    };
    Ok(devices)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[ignore = "local PC Only"]
    #[test]
    fn test_bluetooth_devices() {
        let devices = get_bluetooth_devices().unwrap_or_else(|err| panic!("{err}"));
        let json = serde_json::to_string_pretty(&devices).unwrap_or_else(|err| panic!("{err}"));
        println!("{}", json);
    }
}
