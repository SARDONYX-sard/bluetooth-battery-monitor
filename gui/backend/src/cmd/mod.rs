mod config;
pub(crate) mod device_watcher;
pub mod supports;
pub(super) mod system_tray;

use crate::err_log_to_string;
use tauri::{Builder, Wry};

#[tauri::command]
pub(crate) async fn change_log_level(log_level: Option<&str>) -> Result<(), String> {
    tracing::debug!("Selected log level: {:?}", log_level);
    err_log_to_string!(crate::log::change_level(log_level.unwrap_or("error")))
}

/// Define our own `writeTextFile` api for tauri,
/// because there was a bug that contents were not written properly
/// (there was a case that the order of some data in contents was switched).
#[tauri::command]
pub(crate) async fn write_file(path: &str, content: &str) -> Result<(), String> {
    err_log_to_string!(std::fs::write(path, content))
}

pub(crate) trait CommandsRegister {
    /// Implements custom commands.
    fn impl_commands(self) -> Self;
}

impl CommandsRegister for Builder<Wry> {
    fn impl_commands(self) -> Self {
        self.invoke_handler(tauri::generate_handler![
            change_log_level,
            device_watcher::restart_device_watcher,
            device_watcher::get_devices,
            system_tray::default_tray,
            system_tray::update_tray,
            write_file,
            config::read_config,
            config::write_config,
        ])
    }
}
