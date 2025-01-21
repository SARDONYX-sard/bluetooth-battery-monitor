mod config;
mod supports;
mod system_tray;

pub(super) mod device_watcher;
pub(super) mod interval;

use crate::err_log_to_string;
use tauri::{Builder, Wry};
use tokio::fs;

#[tauri::command]
pub(crate) async fn change_log_level(log_level: Option<&str>) -> Result<(), String> {
    tracing::trace!("Selected log level: {:?}", log_level);
    err_log_to_string!(crate::log::change_level(log_level.unwrap_or("error")))
}

/// Define our own `writeTextFile` api for tauri,
/// because there was a bug that contents were not written properly
/// (there was a case that the order of some data in contents was switched).
#[tauri::command]
pub(crate) async fn write_file(path: &str, content: &str) -> Result<(), String> {
    err_log_to_string!(fs::write(path, content).await)
}

pub(crate) trait CommandsRegister {
    /// Implements custom commands.
    fn impl_commands(self) -> Self;
}

impl CommandsRegister for Builder<Wry> {
    fn impl_commands(self) -> Self {
        self.invoke_handler(tauri::generate_handler![
            change_log_level,
            config::read_config,
            config::write_config,
            device_watcher::get_devices,
            device_watcher::restart_device_watcher,
            interval::restart_interval,
            system_tray::default_tray,
            system_tray::update_tray,
            write_file,
        ])
    }
}
