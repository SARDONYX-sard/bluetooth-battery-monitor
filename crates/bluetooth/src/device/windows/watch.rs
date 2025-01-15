use std::sync::Arc;

use dashmap::DashMap;
use windows::core::HSTRING;
use windows::Devices::Enumeration::{DeviceInformation, DeviceInformationUpdate, DeviceWatcher};
use windows::Foundation::Collections::IIterable;
use windows::Foundation::TypedEventHandler;

use crate::device::device_info::{BluetoothDeviceInfo, SystemTime};

use super::battery::BatteryInfo;
use super::device_searcher::get_bluetooth_devices;

// e0cbf06c-cd8b-4647-bb8a-263b43f0f974 is Bluetooth classic
// https://learn.microsoft.com/en-us/windows-hardware/drivers/install/system-defined-device-setup-classes-available-to-vendors

#[derive(Debug, Clone)]
pub struct Watcher {
    watcher: DeviceWatcher,
    devices: Arc<DashMap<u64, BluetoothDeviceInfo>>,
}

// ref list: https://learn.microsoft.com/ja-jp/windows/win32/properties/devices-bumper
const DEVICE_ADDRESS: &str = "System.Devices.Aep.DeviceAddress";
const IS_CONNECTED: &str = "System.Devices.Aep.IsConnected"; // https://learn.microsoft.com/windows/win32/properties/props-system-devices-aep-isconnected
const LAST_CONNECTED_TIME: &str = "System.DeviceInterface.Bluetooth.LastConnectedTime";

impl Watcher {
    pub fn new() -> crate::error::Result<Self> {
        let watcher = {
            // - ref: https://learn.microsoft.com/uwp/api/windows.devices.enumeration.deviceinformationkind?view=winrt-26100
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
                windows::Devices::Enumeration::DeviceInformationKind::AssociationEndpoint,
            )?
        };

        let devices = {
            let devices = get_bluetooth_devices()?; // From native rust
            let batteries = BatteryInfo::news_from_script()?; // From powershell
            Arc::new(BluetoothDeviceInfo::merge_devices(batteries, devices)?)
        };

        {
            let devices = devices.clone();
            let update_handler = TypedEventHandler::<DeviceWatcher, DeviceInformationUpdate>::new(
                move |_watcher, device_info| {
                    if let Some(device) = device_info.as_ref() {
                        match id_to_address(&mut device.Id()?.to_string().as_str()) {
                            Ok(address) => {
                                if let Some(mut dev) = devices.get_mut(&address) {
                                    let battery = BatteryInfo::from_instance_id(&dev.instance_id);
                                    match battery {
                                        Ok(battery) => {
                                            let dev = dev.value_mut();
                                            dev.battery_level = battery.battery_level;
                                            dev.is_connected = battery.is_connected.unwrap();
                                            dev.last_update = SystemTime::now();
                                        }
                                        Err(e) => {
                                            tracing::error!("{e}");
                                        }
                                    }
                                };
                            }
                            Err(e) => {
                                tracing::error!("{e}");
                            }
                        }
                    };
                    Ok(())
                },
            );
            watcher.Updated(&update_handler)?;
        }

        {
            let devices = devices.clone();
            let remove_handler = TypedEventHandler::<DeviceWatcher, DeviceInformationUpdate>::new(
                move |_watcher, device_info| {
                    if let Some(device) = device_info.as_ref() {
                        println!("==================== Remove ===============");
                        match id_to_address(&mut device.Id()?.to_string().as_str()) {
                            Ok(address) => {
                                devices.remove(&address);
                            }
                            Err(e) => tracing::error!("{e}"),
                        }
                    };
                    Ok(())
                },
            );
            watcher.Removed(&remove_handler)?;
        }

        Ok(Self { watcher, devices })
    }

    pub fn start(&self) -> windows::core::Result<()> {
        self.watcher.Start()
    }

    pub fn stop(&self) -> windows::core::Result<()> {
        self.watcher.Stop()
    }

    pub fn devices(&self) -> &DashMap<u64, BluetoothDeviceInfo> {
        &self.devices
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
