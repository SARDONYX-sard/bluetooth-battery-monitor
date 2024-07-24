#[doc = include_str!("../readme.md")]
mod categories;
pub mod device;
pub mod error;
pub(crate) mod serde_with_date;

pub use device::device_info::BluetoothDeviceInfo;
