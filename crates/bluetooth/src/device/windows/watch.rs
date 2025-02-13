use std::sync::{Arc, LazyLock};
use windows::core::HSTRING;
use windows::Devices::Enumeration::{
    DeviceInformation, DeviceInformationKind, DeviceInformationUpdate, DeviceWatcher,
    DeviceWatcherStatus,
};
use windows::Foundation::Collections::IIterable;
use windows::Foundation::TypedEventHandler;

use super::address_parser::id_to_address;
use super::device_info::get_bluetooth_devices;
use super::inspect::RevealValue as _;
use crate::device::device_info::Devices;
use crate::BluetoothDeviceInfo;

pub static DEVICES: LazyLock<Arc<Devices>> = LazyLock::new(|| {
    Arc::new({
        match get_bluetooth_devices() {
            Ok(devices) => devices,
            Err(err) => {
                tracing::error!("{err}");
                Devices::new()
            }
        }
    })
});

#[derive(Debug, Clone)]
pub struct Watcher {
    watcher: DeviceWatcher,
}

impl Drop for Watcher {
    fn drop(&mut self) {
        if let Err(err) = self.stop() {
            tracing::error!("Failed to stop device watcher: {err}");
        };
    }
}

// Watch targets list
// ref: https://learn.microsoft.com/windows/win32/properties/devices-bumper
const DEVICE_ADDRESS: &str = "System.Devices.Aep.DeviceAddress";
/// https://learn.microsoft.com/windows/win32/properties/props-system-devices-aep-isconnected
const IS_CONNECTED: &str = "System.Devices.Aep.IsConnected";
const LAST_CONNECTED_TIME: &str = "System.DeviceInterface.Bluetooth.LastConnectedTime";

/// TODO: It is unclear whether DEVPKEY watch is possible in PKEY queries. If it is not possible, we may need to switch to interval format.
/// DEVPKEY_Bluetooth_Battery
const BLUETOOTH_BATTERY: &str = "{104ea319-6ee2-4701-bd47-8ddbf425bbe5} 2";

impl Watcher {
    /// Creates a new `Watcher`.
    ///
    /// - `update_fn`: (`newInfo`, changed_connection or not)
    ///
    /// # Errors
    ///
    /// Returns an error if the device watcher fails to be created.
    pub fn new(
        update_fn: impl Fn(&BluetoothDeviceInfo, bool) + Send + 'static,
    ) -> crate::errors::Result<Self> {
        let watcher = {
            // e0cbf06c-cd8b-4647-bb8a-263b43f0f974 is Bluetooth classic
            // - ref: https://learn.microsoft.com/en-us/windows-hardware/drivers/install/system-defined-device-setup-classes-available-to-vendors
            let aqs_filter = HSTRING::from(
                r#"System.Devices.Aep.ProtocolId:="{e0cbf06c-cd8b-4647-bb8a-263b43f0f974}""#,
            );

            // NOTE: For some reason, I can't get it without specifying `kind`.(I've actually tried it myself and confirmed it).
            // ref: https://zenn.dev/link/comments/5e86a7fdbe07a7
            let kind: IIterable<HSTRING> = vec![
                HSTRING::from(BLUETOOTH_BATTERY),
                HSTRING::from(DEVICE_ADDRESS),
                HSTRING::from(IS_CONNECTED), // IsConnected is important, without it the update event will not be triggered on disconnect and add.
                HSTRING::from(LAST_CONNECTED_TIME),
            ]
            .into();
            DeviceInformation::CreateWatcherWithKindAqsFilterAndAdditionalProperties(
                &aqs_filter,
                &kind,
                DeviceInformationKind::AssociationEndpoint,
            )?
        };

        let update_handler = TypedEventHandler::<DeviceWatcher, DeviceInformationUpdate>::new(
            move |_watcher, device_info| {
                let device = match device_info.as_ref() {
                    Some(device) => device,
                    None => return Ok(()),
                };

                let address = match id_to_address(&mut device.Id()?.to_string().as_str()) {
                    Ok(address) => address,
                    Err(e) => {
                        tracing::error!("Failed id to address conversion:\n{e}");
                        return Ok(());
                    }
                };

                match DEVICES.get_mut(&address) {
                    Some(mut dev) => {
                        let map = device.Properties()?;

                        let is_connected = map
                            .Lookup(&HSTRING::from(IS_CONNECTED))
                            .map(|inspect| bool::reveal(&inspect).unwrap_or_default())
                            .unwrap_or_default();

                        match dev.value_mut().update_info(is_connected) {
                            Ok(changed_connection) => update_fn(dev.value(), changed_connection),
                            Err(err) => tracing::error!("{err}"),
                        }
                    }
                    None => {
                        tracing::trace!("This Device address is not found in DashMap: {address}");
                    }
                };

                Ok(())
            },
        );

        watcher.Updated(&update_handler)?;
        watcher.Removed(&update_handler)?;

        Ok(Self { watcher })
    }

    /// Starts the device watcher.
    ///
    /// # Errors
    ///
    /// Returns an error if the device watcher fails to start.
    pub fn start(&self) -> windows::core::Result<()> {
        let status = self.watcher.Status()?;

        if matches!(
            status,
            DeviceWatcherStatus::Created
                | DeviceWatcherStatus::Aborted
                | DeviceWatcherStatus::Stopped
        ) {
            self.watcher.Start()?;
        }
        Ok(())
    }

    /// Stops the device watcher.
    ///
    /// # Errors
    ///
    /// Returns an error if the device watcher fails to stop.
    pub fn stop(&self) -> windows::core::Result<()> {
        let status = self.watcher.Status()?;

        // https://learn.microsoft.com/en-us/uwp/api/windows.devices.enumeration.devicewatcher?view=winrt-26100
        if matches!(
            status,
            DeviceWatcherStatus::Started
                | DeviceWatcherStatus::Aborted
                | DeviceWatcherStatus::EnumerationCompleted
        ) {
            self.watcher.Stop()?;
        }
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::sync::Arc;

    #[ignore = "Can't watch it on CI."]
    #[quick_tracing::try_init]
    #[test]
    fn watch_test() -> crate::errors::Result<()> {
        tracing::debug!("{:#?}", DEVICES.as_ref());

        let watcher = Arc::new(Watcher::new(|_, _| ())?);
        watcher.start()?;
        tracing::info!("Started");

        std::thread::sleep(std::time::Duration::from_secs(15));
        watcher.stop()?;

        // let cloned = Arc::clone(&watcher);
        // let stop_handle = std::thread::spawn(move || -> windows::core::Result<()> {
        //     std::thread::sleep(std::time::Duration::from_secs(15));
        //     cloned.stop()
        // });
        // stop_handle.join().unwrap()?;

        Ok(())
    }
}
