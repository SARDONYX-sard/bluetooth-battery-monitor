use crate::serde_with_date::rfc3339_date_fmt;
use chrono::{DateTime, Utc};

/// Bluetooth battery info
#[cfg_attr(feature = "serde", derive(serde::Serialize, serde::Deserialize))]
#[derive(Debug, Clone, Default, PartialEq, Eq, PartialOrd, Ord, Hash)]
pub struct BatteryInfo {
    /// e.g. 80(%)
    pub battery_level: u64,

    /// e.g. "00112233aabb"
    pub bluetooth_address: String,

    /// e.g. `2360344`
    pub bluetooth_class: u64,

    /// e.g. `E500Pro Hands-Free AG`
    pub friendly_name: String,

    /// e.g. `BTHENUM\\{0000111E-0000-1000-8000-00805F9B34FB}_LOCALMFG&005D...`
    pub instance_id: String,

    /// Probably RFC3339 format.
    ///
    /// e.g. "2024-06-09T12:43:36.636288+09:00"
    #[cfg_attr(feature = "serde", serde(with = "rfc3339_date_fmt"))]
    pub last_arrival_date: DateTime<Utc>,
}

#[cfg(feature = "json")]
mod device_serde {
    use super::*;
    use crate::error::Result;
    use std::os::windows::process::CommandExt as _;

    /// https://learn.microsoft.com/en-us/windows/win32/procthread/process-creation-flags
    struct CreateNoWindow(u32);
    const CREATE_NO_WINDOW: CreateNoWindow = CreateNoWindow(0x08000000);

    impl BatteryInfo {
        /// Create new Devices info from powershell command.
        pub fn news_from_script() -> Result<Vec<Self>> {
            let output = std::process::Command::new("powershell.exe")
                .args([
                    "-ExecutionPolicy",
                    "ByPass",
                    "-Command",
                    include_str!("../../../scripts/get-bluetooth-battery-all.ps1"),
                ])
                .creation_flags(CREATE_NO_WINDOW.0)
                .output()?;
            let json_str = String::from_utf8_lossy(&output.stdout);
            let devices = serde_json::from_str(json_str.trim())?;

            Ok(devices)
        }
    }
}

#[cfg(test)]
mod tests {
    use super::BatteryInfo;

    #[ignore = "Can't find it on CI."]
    #[test]
    #[quick_tracing::init]
    fn get_devices() -> crate::error::Result<()> {
        dbg!(BatteryInfo::news_from_script())?;
        Ok(())
    }
}
