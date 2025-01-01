pub(crate) mod battery_reporter;
mod config;
mod supports;

use crate::err_log;
use bluetooth::{device::device_info::FindBluetooth as _, BluetoothDeviceInfo};
use supports::{default_tray, update_tray};
use tauri::{AppHandle, Builder, Wry};

#[tauri::command]
pub(crate) async fn update_tray_icon(
    app: AppHandle,
    device_name: &str,
    battery_level: u64,
) -> Result<(), String> {
    err_log!(update_tray(&app, device_name, battery_level).await)
}

#[tauri::command]
pub(crate) async fn set_default_tray_icon(app: AppHandle) -> Result<(), String> {
    err_log!(default_tray(&app).await)
}

#[tauri::command]
pub(crate) async fn find_bluetooth_devices() -> Result<Vec<BluetoothDeviceInfo>, String> {
    tracing::trace!("`find_bluetooth_devices` was called.");
    let devices = err_log!(BluetoothDeviceInfo::find_devices())?;
    tracing::debug!("Got devices: {:#?}", devices);
    Ok(devices)
}

#[tauri::command]
pub(crate) async fn change_log_level(log_level: Option<&str>) -> Result<(), String> {
    tracing::debug!("Selected log level: {:?}", log_level);
    err_log!(crate::log::change_level(log_level.unwrap_or("error")))
}

/// Define our own `writeTextFile` api for tauri,
/// because there was a bug that contents were not written properly
/// (there was a case that the order of some data in contents was switched).
#[tauri::command]
pub(crate) async fn write_file(path: &str, content: &str) -> Result<(), String> {
    err_log!(std::fs::write(path, content))
}

pub(crate) trait CommandsRegister {
    /// Implements custom commands.
    fn impl_commands(self) -> Self;
}

impl CommandsRegister for Builder<Wry> {
    fn impl_commands(self) -> Self {
        self.invoke_handler(tauri::generate_handler![
            change_log_level,
            find_bluetooth_devices,
            set_default_tray_icon,
            update_tray_icon,
            write_file,
            battery_reporter::restart_interval,
            config::read_config,
            config::write_config,
        ])
    }
}
