mod buffer;
mod dev_prop;
mod device_instance;

use device_instance::DeviceInstance;
use snafu::Snafu;
use windows::{
    core::{h, Error, PCWSTR},
    Wdk::Devices::Bluetooth::{DEVPKEY_Bluetooth_ClassOfDevice, DEVPKEY_Bluetooth_DeviceAddress},
    Win32::{
        Devices::{
            DeviceAndDriverInstallation::{
                CM_Get_Device_ID_ListW, CM_Get_Device_ID_List_SizeW, CM_Locate_DevNodeW,
                CM_LOCATE_DEVNODE_NORMAL, CR_SUCCESS,
            },
            Properties::{DEVPKEY_Device_FriendlyName, DEVPKEY_Device_LastArrivalDate},
        },
        Foundation::DEVPROPKEY,
    },
};

use crate::{
    categories::{category::Category, errors::CategoryError},
    device::device_info::{Devices, LocalTime},
    BluetoothDeviceInfo,
};

#[allow(non_upper_case_globals)]
const DEVPKEY_Bluetooth_Battery: DEVPROPKEY = DEVPROPKEY {
    fmtid: windows::core::GUID::from_u128(0x104ea319_6ee2_4701_bd47_8ddbf425bbe5),
    pid: 2,
};

#[allow(non_upper_case_globals)]
const DEVPKEY_Bluetooth_IsConnected: DEVPROPKEY = DEVPROPKEY {
    fmtid: windows::core::GUID::from_u128(0x83da6326_97a6_4088_9453_a1923f573b29),
    pid: 15,
};

/// Custom error type using snafu
#[derive(Debug, Snafu)]
pub enum BluetoothDeviceInfoError {
    /// Failed to get device list size.
    FailedToGetDeviceListSize,

    #[snafu(display("Failed to get device: {source}"))]
    FailedToGetDevice { source: Error },

    #[snafu(display("Failed to retrieve device property {key:?}: {source}"))]
    DevicePropertyError { key: DEVPROPKEY, source: Error },

    /// Device not found or missing expected property.
    DeviceNotFound,

    /// Device address not found.
    DeviceAddressNotFound,

    #[snafu(transparent)]
    DevicePropertyTypeError { source: buffer::DevicePropertyError },

    #[snafu(transparent)]
    CategoryError { source: CategoryError },
}

impl BluetoothDeviceInfo {
    fn from_instance_id(id: &[u16]) -> Result<Self, BluetoothDeviceInfoError> {
        let mut device = DeviceInstance::empty();
        let ret = unsafe {
            CM_Locate_DevNodeW(&mut device.0, PCWSTR(id.as_ptr()), CM_LOCATE_DEVNODE_NORMAL)
        };
        if ret != CR_SUCCESS {
            return Err(BluetoothDeviceInfoError::DeviceNotFound);
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
        let last_used = {
            let utc_time = device.get_device_property(&DEVPKEY_Device_LastArrivalDate)?;
            LocalTime::from_utc(utc_time)
        };

        Ok(Self {
            instance_id: String::from_utf16_lossy(id),
            friendly_name: device.get_device_property(&DEVPKEY_Device_FriendlyName)?,
            battery_level: device.get_device_property(&DEVPKEY_Bluetooth_Battery)?,
            address,
            category,
            is_connected: device.get_device_property(&DEVPKEY_Bluetooth_IsConnected)?,
            last_used,
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
    pub fn update_info(&mut self) -> Result<(), BluetoothDeviceInfoError> {
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
pub fn get_bluetooth_devices() -> Result<Devices, BluetoothDeviceInfoError> {
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
        let mut buffer = vec![0u16; buffer_size as usize];

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

        let devices = Devices::new();
        for id in buffer.split(|&c| c == 0).filter(|s| !s.is_empty()) {
            if !id.starts_with(filter) {
                continue;
            }
            let device_info = BluetoothDeviceInfo::from_instance_id(id)?;
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
