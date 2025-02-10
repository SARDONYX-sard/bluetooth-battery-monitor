use crate::device::device_info::LocalTime;
use windows::core::{IInspectable, Interface as _, HSTRING};
use windows::Foundation::IReference;

pub trait RevealValue: Sized {
    /// Reveals the value from an IInspectable.
    ///
    /// # Errors
    /// Returns an error if the value cannot be cast to the expected type.
    fn reveal(value: &IInspectable) -> windows::core::Result<Self>;
}

impl RevealValue for bool {
    fn reveal(value: &IInspectable) -> windows::core::Result<Self> {
        value.cast::<IReference<Self>>()?.Value()
    }
}

impl RevealValue for String {
    fn reveal(value: &IInspectable) -> windows::core::Result<Self> {
        Ok(value.cast::<IReference<HSTRING>>()?.Value()?.to_string())
    }
}

impl RevealValue for u8 {
    fn reveal(value: &IInspectable) -> windows::core::Result<Self> {
        value.cast::<IReference<Self>>()?.Value()
    }
}

impl RevealValue for LocalTime {
    fn reveal(value: &IInspectable) -> windows::core::Result<Self> {
        let val = value
            .cast::<IReference<windows::Foundation::DateTime>>()?
            .Value()?;
        let utc_time = windows_datetime_to_chrono(val.UniversalTime);

        utc_time.map_or_else(
            || {
                Err(windows::core::Error::new(
                    windows::core::HRESULT::from_win32(87), // Invalid parameter
                    "Invalid LocalTime value",
                ))
            },
            |time| Ok(Self::from_utc(&time)),
        )
    }
}

fn windows_datetime_to_chrono(universal_time: i64) -> Option<chrono::DateTime<chrono::Utc>> {
    use chrono::TimeZone as _;

    // Windows FILETIME epoch (1601-01-01) to Unix epoch (1970-01-01) in 100ns units
    const EPOCH_DIFFERENCE_100NS: i64 = 11_644_473_600 * 10_000_000;
    // Adjust to Unix epoch
    let unix_time_100ns = universal_time - EPOCH_DIFFERENCE_100NS;
    // Convert 100ns to seconds and nanoseconds
    let seconds = unix_time_100ns / 10_000_000;
    let nanoseconds = (unix_time_100ns % 10_000_000) * 100;
    // Create chrono::DateTime
    chrono::Utc
        .timestamp_opt(seconds, nanoseconds as u32)
        .latest()
}
