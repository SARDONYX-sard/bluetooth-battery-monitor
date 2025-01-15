use std::sync::Arc;

use dashmap::DashMap;
use windows::core::HSTRING;
use windows::Devices::Enumeration::{DeviceInformation, DeviceInformationUpdate, DeviceWatcher};
use windows::Foundation::Collections::IIterable;
use windows::Foundation::TypedEventHandler;

use crate::BluetoothDeviceInfo;

// e0cbf06c-cd8b-4647-bb8a-263b43f0f974 is Bluetooth classic
// https://learn.microsoft.com/en-us/windows-hardware/drivers/install/system-defined-device-setup-classes-available-to-vendors

#[derive(Debug, Clone)]
pub struct Watcher {
    watcher: DeviceWatcher,
    devices: Arc<DashMap<u64, BluetoothDeviceInfo>>,
}

impl Watcher {
    #[allow(unused)]
    pub fn new() -> windows::core::Result<Self> {
        let watcher = {
            // - ref: https://learn.microsoft.com/uwp/api/windows.devices.enumeration.deviceinformationkind?view=winrt-26100
            let aqs_filter = HSTRING::from(
                r#"System.Devices.Aep.ProtocolId:="{e0cbf06c-cd8b-4647-bb8a-263b43f0f974}""#,
            );

            // NOTE: For some reason, I can't get it without specifying `kind`.(I've actually tried it myself and confirmed it).
            // ref: https://zenn.dev/link/comments/5e86a7fdbe07a7
            let kind: IIterable<HSTRING> = vec![
                HSTRING::from("System.Devices.Aep.DeviceAddress"),
                HSTRING::from("System.Devices.Aep.IsConnected"), // IsConnected is important, without it the update event will not be triggered on disconnect and add.
            ]
            .into();
            DeviceInformation::CreateWatcherWithKindAqsFilterAndAdditionalProperties(
                &aqs_filter,
                &kind,
                windows::Devices::Enumeration::DeviceInformationKind::AssociationEndpoint,
            )?
        };
        let devices = Arc::new(DashMap::new());

        {
            let add_handler = TypedEventHandler::<DeviceWatcher, DeviceInformation>::new(
                |_watcher, device_info| {
                    if let Some(device) = device_info.as_ref() {
                        println!("==================== Add ===============");
                        println!("Name = {}", device.Name()?);
                        println!("Id = {}", device.Id()?);
                        println!("Kind = {}", device.Kind().map(device_kind_to_str)?);
                        println!("IsDefault = {}", device.IsDefault()?);
                        println!("IsEnabled = {}", device.IsEnabled()?);
                        let pairing_info = device.Pairing()?;
                        println!("CanPair = {}", pairing_info.CanPair()?);
                        println!("IsPaired = {}", pairing_info.IsPaired()?);
                    };

                    Ok(())
                },
            );
            watcher.Added(&add_handler)?;
        }

        {
            let update_handler = TypedEventHandler::<DeviceWatcher, DeviceInformationUpdate>::new(
                |_watcher, device_info| {
                    if let Some(device) = device_info.as_ref() {
                        device.Id();
                        println!("==================== Update ===============");
                        print_update_device_info(device)?;
                    };
                    Ok(())
                },
            );
            watcher.Updated(&update_handler)?;
        }

        {
            let remove_handler = TypedEventHandler::<DeviceWatcher, DeviceInformationUpdate>::new(
                |_watcher, device_info| {
                    if let Some(device) = device_info.as_ref() {
                        println!("==================== Remove ===============");
                        print_update_device_info(device)?;
                    };
                    Ok(())
                },
            );
            watcher.Removed(&remove_handler)?;
        }

        Ok(Self { watcher, devices })
    }

    #[allow(unused)]
    pub fn start(&self) -> windows::core::Result<()> {
        self.watcher.Start()
    }

    #[allow(unused)]
    pub fn stop(&self) -> windows::core::Result<()> {
        self.watcher.Stop()
    }
}

fn print_update_device_info(device: &DeviceInformationUpdate) -> windows::core::Result<()> {
    println!("Id = {}", device.Id()?);
    println!("Kind = {}", device.Kind().map(device_kind_to_str)?);
    println!("===========================================");
    Ok(())
}

pub fn device_kind_to_str(
    kind: windows::Devices::Enumeration::DeviceInformationKind,
) -> &'static str {
    match kind.0 {
        1 => "DeviceInterface",
        2 => "DeviceContainer",
        3 => "Device",
        4 => "DeviceInterfaceClass",
        5 => "AssociationEndpoint",
        6 => "AssociationEndpointContainer",
        7 => "AssociationEndpointService",
        8 => "DevicePanel",
        9 => "AssociationEndpointProtocol",
        _ => "Unknown", // 0 or others
    }
}

/// Watch bluetooth classic devices.
#[allow(unused)]
#[cfg(test)]
mod tests {
    use super::*;
    use std::sync::Arc;

    #[ignore = "Can't watch it on CI."]
    #[cfg_attr(feature = "tracing", quick_tracing::try_init)]
    #[test]
    fn watch_test() -> crate::error::Result<()> {
        let watcher = Arc::new(Watcher::new()?);
        watcher.start()?;

        let cloned = watcher.clone();
        let stop_handle = std::thread::spawn(move || -> windows::core::Result<()> {
            std::thread::sleep(std::time::Duration::from_secs(15));
            cloned.stop()
        });
        stop_handle.join().unwrap()?;

        Ok(())
    }
}
