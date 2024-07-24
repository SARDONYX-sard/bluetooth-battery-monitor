use windows::core::HSTRING;
use windows::core::{imp::CreateEventW, PCWSTR};
use windows::Win32::Foundation::{CloseHandle, HANDLE, WAIT_OBJECT_0};
use windows::Win32::System::Registry::{
    RegCloseKey, RegNotifyChangeKeyValue, RegOpenKeyExW, RegQueryValueExW, HKEY,
    HKEY_LOCAL_MACHINE, KEY_NOTIFY, KEY_READ, REG_NOTIFY_CHANGE_LAST_SET, REG_NOTIFY_CHANGE_NAME,
};
use windows::Win32::System::Threading::{ResetEvent, WaitForSingleObject, INFINITE};

#[allow(unused)]
pub fn watch(target_key: &str) -> windows::core::Result<()> {
    unsafe {
        let h_event = HANDLE(CreateEventW(
            core::ptr::null(),
            1,
            0,
            HSTRING::from("RegistryNotificationEvent").as_ptr(),
        ));
        if h_event.is_invalid() {
            #[cfg(feature = "tracing")]
            tracing::error!("CreateEvent error");
            return Ok(());
        }

        #[cfg(feature = "tracing")]
        tracing::trace!("RegOpenKeyExW entered");
        let sub_key = HSTRING::from(target_key);
        let mut h_key = HKEY::default();
        RegOpenKeyExW(
            HKEY_LOCAL_MACHINE,
            &sub_key,
            0,
            KEY_NOTIFY | KEY_READ,
            // KEY_READ,
            &mut h_key,
        )
        .ok()?;
        #[cfg(feature = "tracing")]
        tracing::trace!("RegOpenKeyExW passed");
        read_reg_value(h_key)?;

        loop {
            // Watch the registry key for a change of value.
            RegNotifyChangeKeyValue(
                h_key,
                true,
                REG_NOTIFY_CHANGE_NAME | REG_NOTIFY_CHANGE_LAST_SET,
                h_event,
                true,
            )
            .ok()?;
            #[cfg(feature = "tracing")]
            tracing::trace!("RegNotifyChangeKeyValue passed");

            if WaitForSingleObject(h_event, INFINITE) == WAIT_OBJECT_0 {
                #[cfg(feature = "tracing")]
                tracing::trace!("Registry Change Notification");

                read_reg_value(h_key)?;
            } else {
                break;
            }

            ResetEvent(h_event)?;
        }

        RegCloseKey(h_key).ok()?;
        CloseHandle(h_event)?;
        #[cfg(feature = "tracing")]
        tracing::trace!("Exit");
    }
    Ok(())
}

/// Retrieve the registry value
unsafe fn read_reg_value(h_key: HKEY) -> windows::core::Result<[u8; 1024]> {
    // Retrieve the registry value
    let mut data = [0; 1024];
    let mut data_len = data.len() as u32;

    match RegQueryValueExW(
        h_key,
        PCWSTR::null(),
        None,
        None,
        Some(data.as_mut_ptr() as *mut _),
        Some(&mut data_len),
    )
    .ok()
    {
        Ok(_) => {
            #[cfg(feature = "tracing")]
            {
                tracing::debug!("Registry Value: {data:?}");
            }
        }
        Err(e) => {
            #[cfg(feature = "tracing")]
            tracing::error!("Failed to get registry value: {e}");
        }
    }
    Ok(data)
}

#[cfg(test)]
mod tests {
    #[allow(unused)]
    use super::*;

    #[ignore = "Can't watch it on CI."]
    #[cfg_attr(feature = "tracing", quick_tracing::try_init)]
    #[test]
    fn watch_test() -> crate::error::Result<()> {
        // let instance_id = include_str!("../../../../../secrets/instance_id.txt");
        // let key = &format!(
        //     r"SYSTEM\Setup\Upgrade\PnP\CurrentControlSet\Control\DeviceMigration\Devices\{instance_id}\Properties\{{104ea319-6ee2-4701-bd47-8ddbf425bbe5}}\0002"
        // );

        // watch(key)?;
        Ok(())
    }
}
