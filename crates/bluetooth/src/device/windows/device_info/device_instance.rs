use crate::device::windows::device_info::BluetoothDeviceInfoError;
use windows::{
    core::Error,
    Win32::{
        Devices::{
            DeviceAndDriverInstallation::{CM_Get_DevNode_PropertyW, CR_SUCCESS},
            Properties::DEVPROPTYPE,
        },
        Foundation::DEVPROPKEY,
    },
};

use super::buffer::DeviceProperty;

/// Access handler for device information with 32-bit ptr.
#[repr(transparent)]
#[derive(Debug, Clone, Copy, Default, PartialEq, Eq, PartialOrd, Ord, Hash)]
pub struct DeviceInstance(pub u32);

impl DeviceInstance {
    /// Create a new device instance
    pub const fn new(value: u32) -> Self {
        Self(value)
    }

    /// Create a null ptr device instance
    pub const fn empty() -> Self {
        Self(0)
    }

    /// Retrieves the property for a device instance
    pub fn get_device_property<T>(
        &self,
        property_key: &DEVPROPKEY,
    ) -> Result<T, BluetoothDeviceInfoError>
    where
        T: DeviceProperty,
    {
        let mut property_type: DEVPROPTYPE = DEVPROPTYPE(0);
        let mut buffer = T::new_buffer();
        let mut buffer_size: u32 = core::mem::size_of_val(&buffer) as u32;
        let buf_ptr: *mut <T as DeviceProperty>::Buffer = &mut buffer;

        unsafe {
            let ret = CM_Get_DevNode_PropertyW(
                self.0,
                property_key,
                &mut property_type,
                Some(buf_ptr.cast()),
                &mut buffer_size,
                0,
            );

            if ret != CR_SUCCESS {
                return Err(BluetoothDeviceInfoError::DevicePropertyError {
                    key: *property_key,
                    source: Error::from_win32(),
                });
            }

            Ok(T::from_buffer(buffer, property_type)?)
        }
    }
}
