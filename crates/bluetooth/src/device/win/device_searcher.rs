use crate::error::Result;
use std::{collections::HashMap, mem, ptr};
use windows::Win32::{
    Devices::Bluetooth::{
        BluetoothFindDeviceClose, BluetoothFindFirstDevice, BluetoothFindNextDevice,
        BluetoothGetDeviceInfo, BLUETOOTH_DEVICE_SEARCH_PARAMS,
    },
    Foundation::{FALSE, HANDLE, TRUE},
};

pub type SysBluetoothDeviceInfo = windows::Win32::Devices::Bluetooth::BLUETOOTH_DEVICE_INFO;

pub fn get_bluetooth_devices() -> Result<HashMap<u64, SysBluetoothDeviceInfo>> {
    // See: https://learn.microsoft.com/windows/win32/api/bluetoothapis/ns-bluetoothapis-bluetooth_device_search_params
    let search_params: BLUETOOTH_DEVICE_SEARCH_PARAMS = BLUETOOTH_DEVICE_SEARCH_PARAMS {
        // size of the structure (in bytes).
        dwSize: core::mem::size_of::<BLUETOOTH_DEVICE_SEARCH_PARAMS>() as u32,
        // A value indicating that an authenticated Bluetooth device must be returned in the search.
        fReturnAuthenticated: FALSE,
        // value indicating that a remembered Bluetooth device must be returned in the search.
        fReturnRemembered: TRUE,
        // value that specifies that the search should return an unknown Bluetooth device.
        fReturnUnknown: TRUE,
        // a value indicating that the search must return connected Bluetooth devices.
        fReturnConnected: FALSE,
        // a value indicating that a new inquiry needs to be issued.
        fIssueInquiry: TRUE,
        // A value indicating the inquiry timeout, expressed in 1.28 second increments.
        // For example, the cTimeoutMultiplier value for a 12.8 second inquiry is 10.
        // The maximum value for this member is 48. If a value greater than 48 is used,
        // the calling function will fail immediately and return E_INVALIDARG.
        cTimeoutMultiplier: 2,
        // Handle to the radio to perform the query. Set to NULL to perform the query on all local Bluetooth radios.
        hRadio: HANDLE(ptr::null_mut()),
    };

    let mut device_info = SysBluetoothDeviceInfo {
        dwSize: mem::size_of::<SysBluetoothDeviceInfo>() as u32,
        ..Default::default()
    };

    let search_handle = unsafe { BluetoothFindFirstDevice(&search_params, &mut device_info)? };
    if search_handle.is_invalid() {
        return Err(windows::core::Error::from_win32().into());
    };

    let mut res = HashMap::new();
    loop {
        match unsafe { BluetoothGetDeviceInfo(HANDLE(search_handle.0), &mut device_info) } {
            err_code if err_code != 0 => {
                #[cfg(feature = "tracing")]
                tracing::error!("Error code: {err_code}");
                break;
            }
            result => result,
        };
        let addr = unsafe { device_info.Address.Anonymous.ullLong };
        res.insert(addr, device_info);

        if unsafe { BluetoothFindNextDevice(search_handle, &mut device_info).is_err() } {
            break;
        }
    }

    unsafe { BluetoothFindDeviceClose(search_handle)? };

    Ok(res)
}
