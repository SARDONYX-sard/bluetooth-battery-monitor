use std::sync::Arc;

use dashmap::DashMap;
use windows::core::{Interface, HSTRING};
use windows::Devices::Enumeration::{DeviceInformation, DeviceInformationUpdate, DeviceWatcher};
use windows::Foundation::Collections::IIterable;
use windows::Foundation::{DateTime, IReference, TypedEventHandler};

use crate::BluetoothDeviceInfo;

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
        let devices = Arc::new(DashMap::new());

        {
            let add_handler = TypedEventHandler::<DeviceWatcher, DeviceInformation>::new(
                |_watcher, device_info| {
                    if let Some(device) = device_info.as_ref() {
                        let id = device.Id()?.to_string();
                        let address = id_to_address(&mut id.as_str()).unwrap();
                        let name = device.Name()?;
                        let is_connected = device.Pairing()?.IsPaired()?;

                        // if !devices.contains_key(&address) {
                        //     let device = BluetoothDeviceInfo {
                        //         friendly_name: device.Name()?.to_string(),
                        //         address,
                        //         battery_level: 0,
                        //         category: Default::default(),
                        //         is_connected,
                        //         last_used: Default::default(),
                        //     };
                        //     devices.insert(address, value)
                        // }
                        println!("==================== Add ===============");
                        println!("Name = {}", device.Name()?);
                        println!("Id = {}", device.Id()?);
                        println!("Kind = {}", device.Kind().map(device_kind_to_str)?);

                        // ref: https://github.com/microsoft/windows-rs/issues/2604#issuecomment-1677977514
                        let map = device.Properties()?;

                        let is_connected = map
                            .Lookup(&HSTRING::from(IS_CONNECTED))?
                            .cast::<IReference<bool>>()?
                            .Value()?;
                        println!("IsConnected = {is_connected}");

                        let date = map
                            .Lookup(&HSTRING::from(LAST_CONNECTED_TIME))?
                            .cast::<IReference<DateTime>>()?
                            .Value()?;
                        dbg!(windows_datetime_to_chrono(date.UniversalTime));
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

fn windows_datetime_to_chrono(universal_time: i64) -> chrono::DateTime<chrono::Utc> {
    use chrono::TimeZone as _;

    // Windows FILETIME epoch (1601-01-01) to Unix epoch (1970-01-01) in 100ns units
    const EPOCH_DIFFERENCE_100NS: i64 = 11_644_473_600 * 10_000_000;

    // Adjust to Unix epoch
    let unix_time_100ns = universal_time - EPOCH_DIFFERENCE_100NS;

    // Convert 100ns to seconds and nanoseconds
    let seconds = unix_time_100ns / 10_000_000;
    let nanoseconds = (unix_time_100ns % 10_000_000) * 100;

    // Create chrono::DateTime
    chrono::Utc
        .timestamp_opt(seconds, nanoseconds as u32)
        .unwrap()
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
