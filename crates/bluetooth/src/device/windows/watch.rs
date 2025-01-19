use std::sync::{Arc, LazyLock};
use windows::core::HSTRING;
use windows::Devices::Enumeration::{
    DeviceInformation, DeviceInformationKind, DeviceInformationUpdate, DeviceWatcher,
    DeviceWatcherStatus,
};
use windows::Foundation::Collections::IIterable;
use windows::Foundation::TypedEventHandler;

use super::device_info::get_bluetooth_devices;
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

// ref list: https://learn.microsoft.com/ja-jp/windows/win32/properties/devices-bumper
const DEVICE_ADDRESS: &str = "System.Devices.Aep.DeviceAddress";
const IS_CONNECTED: &str = "System.Devices.Aep.IsConnected"; // https://learn.microsoft.com/windows/win32/properties/props-system-devices-aep-isconnected
const LAST_CONNECTED_TIME: &str = "System.DeviceInterface.Bluetooth.LastConnectedTime";

impl Watcher {
    /// Creates a new `Watcher`.
    ///
    /// # Errors
    ///
    /// Returns an error if the device watcher fails to be created.
    pub fn new(
        update_fn: impl Fn(&BluetoothDeviceInfo) + Send + 'static,
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
                        tracing::error!("{e}");
                        return Ok(());
                    }
                };

                match DEVICES.get_mut(&address) {
                    Some(mut dev) => match dev.value_mut().update_info() {
                        Ok(_) => update_fn(dev.value()),
                        Err(err) => tracing::error!("{err}"),
                    },
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
            DeviceWatcherStatus::Started | DeviceWatcherStatus::EnumerationCompleted
        ) {
            self.watcher.Stop()?;
        }
        Ok(())
    }
}

/// Convert address string (e.g., `Bluetooth#Bluetooth00:00:00:ff:ff:00-de:ad:be:ee:ee:ef`) into a u64.
fn id_to_address(id: &mut &str) -> winnow::PResult<u64> {
    use winnow::prelude::Parser as _;

    let input = id;
    let prefix = "Bluetooth#Bluetooth";
    let _ = (prefix, hex_address, '-').parse_next(input)?;

    // Convert address string (e.g., "00:00:00:ff:ff:00") into a u64.
    let address = hex_address.parse_next(input)?;
    let combined = ((address.0 as u64) << 40)
        | ((address.1 as u64) << 32)
        | ((address.2 as u64) << 24)
        | ((address.3 as u64) << 16)
        | ((address.4 as u64) << 8)
        | (address.5 as u64);
    Ok(combined)
}

fn hex_primary(input: &mut &str) -> winnow::PResult<u8> {
    use winnow::token::take_while;
    use winnow::Parser;

    take_while(2, |c: char| c.is_ascii_hexdigit())
        .try_map(|input| u8::from_str_radix(input, 16))
        .parse_next(input)
}

/// Parse hex address e.g. `de:ad:be:ee:ee:ef`
fn hex_address(input: &mut &str) -> winnow::PResult<(u8, u8, u8, u8, u8, u8)> {
    use winnow::seq;
    use winnow::Parser as _;

    seq! {
        hex_primary,
        _: ':',
        hex_primary,
        _: ':',
        hex_primary,
        _: ':',

        hex_primary,
        _: ':',
        hex_primary,
        _: ':',
        hex_primary,
    }
    .parse_next(input)
}

/// Watch bluetooth classic devices.
#[allow(unused)]
#[cfg(test)]
mod tests {
    use super::*;
    use std::sync::Arc;
    use winnow::Parser as _;

    #[test]
    fn test_id_to_address() {
        let id = "Bluetooth#Bluetooth00:00:00:ff:ff:00-de:ad:be:ee:ee:ef";
        let address = id_to_address
            .parse(id)
            .unwrap_or_else(|err| panic!("{err}"));
        assert_eq!(address, 0xdeadbeeeeeef);
    }

    #[ignore = "Can't watch it on CI."]
    #[cfg_attr(feature = "tracing", quick_tracing::try_init)]
    #[test]
    fn watch_test() -> crate::errors::Result<()> {
        let watcher = Arc::new(Watcher::new(|_| ())?);
        watcher.start()?;
        dbg!("Started");

        let cloned = Arc::clone(&watcher);
        let stop_handle = std::thread::spawn(move || -> windows::core::Result<()> {
            for i in 0..15 {
                dbg!(i);
                std::thread::sleep(std::time::Duration::from_secs(1));
            }
            cloned.stop()
        });
        stop_handle.join().unwrap()?;

        Ok(())
    }
}
