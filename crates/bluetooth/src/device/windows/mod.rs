pub mod battery;
pub mod device_searcher;
pub mod watch;

use super::device_info::{BluetoothDeviceInfo, SystemTime};
use crate::{categories::category::Category, error::Result};
use battery::BatteryInfo;
use dashmap::DashMap;
use device_searcher::SysBluetoothDeviceInfo;
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
            last_update: SystemTime::now(),
        })
    }

    /// Merge device info and new device info
    fn merge_devices(
        batteries: Vec<BatteryInfo>,
        devices: HashMap<u64, SysBluetoothDeviceInfo>,
    ) -> Result<DashMap<u64, Self>> {
        let res = DashMap::new();
        for battery_info in batteries {
            let addr = u64::from_str_radix(&battery_info.bluetooth_address, 16)?;
            if let Some(dev) = devices.get(&addr) {
                res.insert(addr, Self::from(battery_info, *dev)?);
            };
        }
        Ok(res)
    }
}
