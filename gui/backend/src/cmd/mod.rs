pub(crate) mod battery_reporter;
mod bluetooth_info_cache;
mod config;
mod supports;

use crate::err_log;
use bluetooth::{device::device_info::FindBluetooth as _, BluetoothDeviceInfo};

#[tauri::command]
pub(crate) async fn update_tray_icon(
    app: AppHandle,
    device_name: &str,
    battery_level: u64,
) -> Result<(), String> {
    err_log!(update_tray(&app, device_name, battery_level).await)
}

#[tauri::command]
pub(crate) async fn find_bluetooth_devices() -> Result<Vec<BluetoothDeviceInfo>, String> {
    err_log!(BluetoothDeviceInfo::find_devices())
}

#[tauri::command]
pub(crate) async fn change_log_level(log_level: Option<&str>) -> Result<(), String> {
    use supports::change_log_level;
    tracing::debug!("Selected log level: {:?}", log_level);
    err_log!(change_log_level(log_level.unwrap_or("error")))
}

/// Define our own `writeTextFile` api for tauri,
/// because there was a bug that contents were not written properly
/// (there was a case that the order of some data in contents was switched).
#[tauri::command]
pub(crate) async fn write_file(path: &str, content: &str) -> Result<(), String> {
    err_log!(std::fs::write(path, content))
}

use supports::update_tray;
use tauri::{AppHandle, Builder, Wry};

pub(crate) trait CommandsRegister {
    /// Implements custom commands.
    fn impl_commands(self) -> Self;
}

impl CommandsRegister for Builder<Wry> {
    fn impl_commands(self) -> Self {
        self.invoke_handler(tauri::generate_handler![
            change_log_level,
            find_bluetooth_devices,
            update_tray_icon,
            write_file,
            battery_reporter::restart_interval,
            bluetooth_info_cache::read_bt_cache,
            bluetooth_info_cache::write_bt_cache,
            config::read_config,
            config::write_config,
        ])
    }
}
