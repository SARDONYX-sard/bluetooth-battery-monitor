use crate::categories::category::Category;
use chrono::{Datelike as _, Timelike as _};
use dashmap::DashMap;

/// key: bluetooth address
/// value: bluetooth device information
pub type Devices = DashMap<u64, BluetoothDeviceInfo>;

/// Bluetooth battery info
#[cfg_attr(feature = "serde", derive(serde::Serialize, serde::Deserialize))]
#[derive(Debug, Clone, Default, PartialEq, Eq, PartialOrd, Ord, Hash)]
pub struct BluetoothDeviceInfo {
    /// e.g. `BTHENUM\\{0000111E-0000-1000-8000-00805F9B34FB}_LOCALMFG&005D...`
    pub instance_id: String,
    /// e.g. `E500Pro Hands-Free AG`
    pub friendly_name: String,
    /// e.g. 80(%)
    pub battery_level: u8,
    /// e.g. "00112233aabb"
    pub address: u64,
    pub category: Category,
    /// Is this device connected?
    pub is_connected: bool,
    /// `{year}/{month}/{day} {hour}:{minute}:{second}`
    pub last_used: LocalTime,
    pub last_updated: LocalTime,

    /// device id
    pub device_instance: u32,
}

/// Local time
#[cfg_attr(
    feature = "serde",
    derive(serde_with::DeserializeFromStr, serde_with::SerializeDisplay,)
)]
#[derive(
    Debug,
    Clone,
    Default,
    PartialEq,
    Eq,
    PartialOrd,
    Ord,
    Hash,
    parse_display::Display,
    parse_display::FromStr,
)]
#[display("{year}/{month}/{day} {hour}:{minute}:{second}")]
pub struct LocalTime {
    pub year: u16,
    pub month: u16,
    pub day: u16,
    pub hour: u16,
    pub minute: u16,
    pub second: u16,
}

impl LocalTime {
    /// Create a new system time
    pub fn now() -> Self {
        let now = chrono::Local::now();
        Self {
            year: now.year() as u16,
            month: now.month() as u16,
            day: now.day() as u16,
            hour: now.hour() as u16,
            minute: now.minute() as u16,
            second: now.second() as u16,
        }
    }

    pub fn from_utc(utc_time: &chrono::DateTime<chrono::Utc>) -> Self {
        let time = utc_time.with_timezone(&chrono::Local);
        Self {
            year: time.year() as u16,
            month: time.month() as u16,
            day: time.day() as u16,
            hour: time.hour() as u16,
            minute: time.minute() as u16,
            second: time.second() as u16,
        }
    }
}
