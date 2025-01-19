#[doc = include_str!("../readme.md")]
mod categories;
pub mod device;
pub mod errors;

pub use device::device_info::BluetoothDeviceInfo;
