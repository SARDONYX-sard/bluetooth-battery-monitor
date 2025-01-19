//! Error types for Converter

use crate::categories::sub_category::{MajorCategory, SubCategory4, SubCategory5};

/// Each variant of the enum represents a specific type of error,
/// such as error messages or other relevant information.
#[derive(Debug, snafu::Snafu)]
#[snafu(visibility(pub))]
pub enum BluetoothError {
    #[snafu(display("Failed to cast major category as u32: {major}"))]
    FailedToCastMajorCatError { major: MajorCategory },
    #[snafu(display("Failed to cast sub category4 as u32: {sub}"))]
    FailedToCastCat4Error { sub: SubCategory4 },
    #[snafu(display("Failed to cast sub category5 as u32: {sub}"))]
    FailedToCastCat5Error { sub: SubCategory5 },

    #[snafu(display("Failed to parse: {err}"))]
    WinnowError {
        err: winnow::error::ErrMode<winnow::error::ContextError>,
    },

    #[snafu(transparent)]
    ParseIntError { source: core::num::ParseIntError },
    #[snafu(transparent)]
    IoError { source: std::io::Error },
    #[snafu(transparent)]
    JsonError { source: serde_json::Error },

    #[cfg(target_os = "windows")]
    #[snafu(transparent)]
    BluetoothError {
        source: crate::device::windows::device_info::BluetoothDeviceInfoError,
    },
    #[snafu(transparent)]
    #[cfg(target_os = "windows")]
    Error { source: windows::core::Error },
}

/// A specialized [Result] type
pub type Result<T, Error = BluetoothError> = core::result::Result<T, Error>;
