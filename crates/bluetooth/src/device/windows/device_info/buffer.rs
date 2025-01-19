// SPDX-License-Identifier: Apache-2.0 OR MIT
// from kevinmehall nusb crate
// ref
// - https://github.com/kevinmehall/nusb/blob/v0.1.12/src/platform/windows_winusb/cfgmgr32.rs

use chrono::{DateTime, Utc};
use snafu::Snafu;
use windows::{
    core::Error,
    Win32::{
        Devices::Properties::{
            DEVPROPTYPE, DEVPROP_TYPE_BOOLEAN, DEVPROP_TYPE_BYTE, DEVPROP_TYPE_DOUBLE,
            DEVPROP_TYPE_FILETIME, DEVPROP_TYPE_FLOAT, DEVPROP_TYPE_INT16, DEVPROP_TYPE_INT32,
            DEVPROP_TYPE_INT64, DEVPROP_TYPE_SBYTE, DEVPROP_TYPE_STRING, DEVPROP_TYPE_UINT16,
            DEVPROP_TYPE_UINT32, DEVPROP_TYPE_UINT64,
        },
        Foundation::FILETIME,
    },
};

use super::dev_prop::DevPropType;

pub trait DeviceProperty: Sized {
    type Buffer;

    fn new_buffer() -> Self::Buffer;

    fn from_buffer(
        buffer: Self::Buffer,
        property_type: DEVPROPTYPE,
    ) -> Result<Self, DevicePropertyError>;
}

/// Custom error type using snafu
#[derive(Debug, Snafu)]
pub enum DevicePropertyError {
    #[snafu(display("Failed to retrieve device property: {}", source))]
    DevicePropertyError { source: Error },

    #[snafu(display(
        "Expected device property type {:?}, but got {:?}",
        DevPropType::from_u32(*expected),
        DevPropType::from_u32(*actual),
    ))]
    TypeError { actual: u32, expected: u32 },
}

// Add similar implementations for other types:
macro_rules! impl_device_property {
    ($type:ty, $buffer:ty, $($prop:ident),+) => {
        impl DeviceProperty for $type {
            type Buffer = $buffer;

            fn new_buffer() -> Self::Buffer {
                Default::default()
            }

            fn from_buffer(
                buffer: Self::Buffer,
                property_type: DEVPROPTYPE,
            ) -> Result<Self, DevicePropertyError> {
                match property_type {
                    $(x if x == $prop => Ok(buffer as $type),)+
                    _ => Err(DevicePropertyError::TypeError {
                        actual: property_type.0,
                        expected: DEVPROP_TYPE_BOOLEAN.0,
                    }),
                }
            }
        }
    };
}

// Implementations for primitive types
impl_device_property!(u16, u16, DEVPROP_TYPE_UINT16);
impl_device_property!(u32, u32, DEVPROP_TYPE_UINT32);
impl_device_property!(u64, u64, DEVPROP_TYPE_UINT64);
impl_device_property!(f32, f32, DEVPROP_TYPE_FLOAT);
impl_device_property!(f64, f64, DEVPROP_TYPE_DOUBLE);
impl_device_property!(i16, i16, DEVPROP_TYPE_INT16);
impl_device_property!(i32, i32, DEVPROP_TYPE_INT32);
impl_device_property!(i64, i64, DEVPROP_TYPE_INT64);
impl_device_property!(u8, u8, DEVPROP_TYPE_BYTE);
impl_device_property!(i8, i8, DEVPROP_TYPE_SBYTE);

impl DeviceProperty for String {
    type Buffer = [u16; 1024];

    fn new_buffer() -> Self::Buffer {
        [0; 1024]
    }

    fn from_buffer(
        buffer: Self::Buffer,
        property_type: DEVPROPTYPE,
    ) -> Result<Self, DevicePropertyError> {
        if property_type != DEVPROP_TYPE_STRING {
            return Err(DevicePropertyError::TypeError {
                actual: property_type.0,
                expected: DEVPROP_TYPE_STRING.0,
            });
        }

        let null_index = buffer.iter().position(|&c| c == 0).unwrap_or(buffer.len());
        let truncated_buffer = &buffer[..null_index];
        Ok(Self::from_utf16_lossy(truncated_buffer))
    }
}

impl DeviceProperty for bool {
    type Buffer = u8;

    fn new_buffer() -> Self::Buffer {
        0
    }

    fn from_buffer(
        buffer: Self::Buffer,
        property_type: DEVPROPTYPE,
    ) -> Result<Self, DevicePropertyError> {
        match property_type {
            DEVPROP_TYPE_BOOLEAN => Ok(buffer == 1),
            _ => Err(DevicePropertyError::TypeError {
                actual: property_type.0,
                expected: DEVPROP_TYPE_BOOLEAN.0,
            }),
        }
    }
}

impl DeviceProperty for DateTime<Utc> {
    type Buffer = FILETIME;

    fn new_buffer() -> Self::Buffer {
        FILETIME {
            dwLowDateTime: 0,
            dwHighDateTime: 0,
        }
    }

    fn from_buffer(
        buffer: Self::Buffer,
        property_type: DEVPROPTYPE,
    ) -> Result<Self, DevicePropertyError> {
        match property_type {
            DEVPROP_TYPE_FILETIME => Ok(to_datetime(&buffer)),
            _ => Err(DevicePropertyError::TypeError {
                actual: property_type.0,
                expected: DEVPROP_TYPE_BOOLEAN.0,
            }),
        }
    }
}

/// FILETIME to chrono::DateTime<Utc>
fn to_datetime(file_time: &FILETIME) -> chrono::DateTime<chrono::Utc> {
    // FILETIME => 1601-01-01T00:00:00Z standard
    const FILETIME_EPOCH: i64 = 11644473600; // 1970 - 1601 secs
    const HUNDRED_NANOSECONDS: i64 = 10_000_000; // 100nano to secs

    let filetime = ((file_time.dwHighDateTime as u64) << 32) | (file_time.dwLowDateTime as u64);

    let unix_timestamp = (filetime / HUNDRED_NANOSECONDS as u64) as i64 - FILETIME_EPOCH;
    let nano_seconds = ((filetime % HUNDRED_NANOSECONDS as u64) * 100) as u32;

    use chrono::TimeZone as _;
    chrono::Utc
        .timestamp_opt(unix_timestamp, nano_seconds)
        .unwrap()
}
