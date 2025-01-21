use windows::core::{IInspectable, Interface as _, HSTRING};
use windows::Foundation::Collections::IKeyValuePair;
use windows::Foundation::IReference;

use crate::device::device_info::LocalTime;

/// print property key and value.
///
/// # Errors
/// If failed to type cast
pub fn reveal_value(prop: IKeyValuePair<HSTRING, IInspectable>) -> windows::core::Result<()> {
    let key = prop.Key()?;
    let value = prop.Value()?;

    match value.GetRuntimeClassName()?.to_string().as_str() {
        "Windows.Foundation.IReference`1<Boolean>" => {
            let val: bool = value.cast::<IReference<bool>>()?.Value()?;
            println!("{} = {} (Boolean)", key, val);
        }
        "Windows.Foundation.IReference`1<String>" => {
            let val: HSTRING = value.cast::<IReference<HSTRING>>()?.Value()?;
            println!("{} = {} (String)", key, val);
        }
        "Windows.Foundation.IReference`1<UInt8>" => {
            let val: u8 = value.cast::<IReference<u8>>()?.Value()?;
            println!("{} = {} (UInt8)", key, val);
        }
        "Windows.Foundation.IReference`1<Windows.Foundation.DateTime>" => {
            let val = value
                .cast::<IReference<windows::Foundation::DateTime>>()?
                .Value()?;

            let utc_time = windows_datetime_to_chrono(val.UniversalTime);
            println!("{} = {:?} (DateTime)", key, LocalTime::from_utc(&utc_time));
        }
        unknown => {
            println!("{key} = <Unknown Type: {unknown}>");
        }
    }

    Ok(())
}

fn windows_datetime_to_chrono(universal_time: i64) -> chrono::DateTime<chrono::Utc> {
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
        .unwrap()
}
