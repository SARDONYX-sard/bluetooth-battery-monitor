pub mod battery;
pub mod device_searcher;
mod register;

use super::device_info::{BluetoothDeviceInfo, FindBluetooth, SystemTime};
use crate::{categories::category::Category, error::Result};
use battery::BatteryInfo;
use device_searcher::{get_bluetooth_devices, SysBluetoothDeviceInfo};
use std::collections::HashMap;

impl BluetoothDeviceInfo {
    fn from(battery_info: BatteryInfo, device_info: SysBluetoothDeviceInfo) -> Result<Self> {
        Ok(Self {
            friendly_name: battery_info.friendly_name,
            category: Category::try_from(device_info.ulClassofDevice)?,
            battery_level: battery_info.battery_level,
            is_connected: device_info.fConnected.as_bool(),
            instance_id: battery_info.instance_id,
            address: unsafe { device_info.Address.Anonymous.ullLong },
            last_used: SystemTime {
                year: device_info.stLastUsed.wYear,
                month: device_info.stLastUsed.wMonth,
                day: device_info.stLastUsed.wDay,
                hour: device_info.stLastUsed.wHour,
                minute: device_info.stLastUsed.wMinute,
                second: device_info.stLastUsed.wSecond,
            },
        })
    }

    /// Merge device info and new device info
    fn merge_devices(
        batteries: Vec<BatteryInfo>,
        devices: HashMap<u64, SysBluetoothDeviceInfo>,
    ) -> Result<Vec<Self>> {
        let mut res = vec![];
        for battery_info in batteries {
            let addr = u64::from_str_radix(&battery_info.bluetooth_address, 16)?;
            if let Some(dev) = devices.get(&addr) {
                res.push(Self::from(battery_info, *dev)?);
            };
        }
        Ok(res)
    }
}

// Implement common trait
impl FindBluetooth for BluetoothDeviceInfo {
    /// Finds the bluetooth devices. (This is windows edition)
    fn find_devices() -> Result<Vec<BluetoothDeviceInfo>> {
        let devices = get_bluetooth_devices()?;
        let batteries = BatteryInfo::news_from_script()?;
        BluetoothDeviceInfo::merge_devices(batteries, devices)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[ignore = "Can't find it on CI."]
    #[test]
    fn test_get_devices_info() -> Result<()> {
        let dev = BluetoothDeviceInfo::find_devices()?;
        println!("{:#?}", dev);
        Ok(())
    }
}
