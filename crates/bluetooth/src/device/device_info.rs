use crate::{categories::category::Category, error::Result};

/// Bluetooth battery info
#[cfg_attr(feature = "serde", derive(serde::Serialize, serde::Deserialize))]
#[derive(Debug, Clone, Default, PartialEq, Eq, PartialOrd, Ord, Hash)]
pub struct BluetoothDeviceInfo {
    /// e.g. `E500Pro Hands-Free AG`
    pub friendly_name: String,

    /// e.g. `BTHENUM\\{0000111E-0000-1000-8000-00805F9B34FB}_LOCALMFG&005D...`
    pub instance_id: String,

    pub address: u64,

    /// e.g. 80(%)
    pub battery_level: u64,

    pub category: Category,

    pub is_connected: bool,

    /// Native time
    /// e.g. `2024/4/19 22:42:16`
    pub last_used: SystemTime,
}

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
pub struct SystemTime {
    pub year: u16,
    pub month: u16,
    pub day: u16,
    pub hour: u16,
    pub minute: u16,
    pub second: u16,
}

/// Cross-platform common methods
pub trait FindBluetooth {
    /// Get Bluetooth devices information.
    fn find_devices() -> Result<Vec<BluetoothDeviceInfo>>;
}
