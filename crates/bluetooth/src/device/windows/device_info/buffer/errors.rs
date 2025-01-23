use snafu::Snafu;
use windows::core::Error;

use crate::device::windows::device_info::device_property::DevPropType;

/// Custom error type using snafu
#[derive(Debug, Snafu)]
pub enum DevicePropertyError {
    #[snafu(display("Failed to retrieve device property: {}", source))]
    DevicePropertyError { source: Error },

    #[snafu(display(
        "Expected device property type {}, but got {}",
        DevPropType::from_u32(*expected).map_or("Unknown", |t|t.as_str()),
        DevPropType::from_u32(*actual).map_or("Unknown", |t|t.as_str()),
    ))]
    TypeError { actual: u32, expected: u32 },
}
