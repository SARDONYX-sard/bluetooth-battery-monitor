use windows::core::HSTRING;
use windows::Devices::Enumeration::{DeviceInformation, DeviceInformationUpdate, DeviceWatcher};
use windows::Foundation::TypedEventHandler;

/// Watch bluetooth classic devices.
#[allow(unused)]
pub fn watch(target_key: &str) -> windows::core::Result<()> {
    let watcher = {
        // - ref: https://learn.microsoft.com/uwp/api/windows.devices.enumeration.deviceinformationkind?view=winrt-26100
        let aqs_filter = HSTRING::from(
            "System.Devices.Aep.ProtocolId:=\"{e0cbf06c-cd8b-4647-bb8a-263b43f0f974}\" AND System.Devices.Aep.ProviderName:=\"Bluetooth\""
        );
        DeviceInformation::CreateWatcherAqsFilter(&aqs_filter)?
    };

    {
        let add_handler =
            TypedEventHandler::<DeviceWatcher, DeviceInformation>::new(|watcher, device_info| {
                #[cfg(feature = "tracing")]
                tracing::info!("Kind = {:?}", device_info.as_ref().unwrap().Kind());
                Ok(())
            });
        watcher.Added(&add_handler);
    }

    {
        let update_handler = TypedEventHandler::<DeviceWatcher, DeviceInformationUpdate>::new(
            |watcher, device_info| {
                #[cfg(feature = "tracing")]
                tracing::info!("Kind = {:?}", device_info.as_ref().unwrap().Kind());
                Ok(())
            },
        );
        watcher.Updated(&update_handler);
    }

    {
        let remove_handler = TypedEventHandler::<DeviceWatcher, DeviceInformationUpdate>::new(
            |watcher, device_info| {
                #[cfg(feature = "tracing")]
                tracing::info!("Kind = {:?}", device_info.as_ref().unwrap().Kind());
                Ok(())
            },
        );
        watcher.Removed(&remove_handler);
    }

    watcher.Start()?;
    Ok(())
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

        watch("")?;
        Ok(())
    }
}
