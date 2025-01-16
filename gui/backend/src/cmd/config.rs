use std::{fs::read_to_string, path::PathBuf};

use crate::err_log_to_string;
use tauri::{AppHandle, Manager};

#[derive(Debug, serde::Deserialize, serde::Serialize)]
pub struct Config {
    /// Bluetooth address e.g. `0xdeadbeeeeeef`
    pub address: u64,

    /// e.g. `60`(minutes) == 1hour
    pub battery_query_duration_minutes: u64,

    /// e.g. `20`(%)
    pub notify_battery_level: u64,
}

impl Default for Config {
    fn default() -> Self {
        Self {
            address: 0,
            battery_query_duration_minutes: 60,
            notify_battery_level: 20,
        }
    }
}

fn get_config_path(app: &AppHandle) -> Result<PathBuf, String> {
    let resolver = app.path();
    let config_dir = err_log_to_string!(resolver.app_config_dir())?;
    let config_path = config_dir.join(format!("{}_config.json", app.package_info().name));
    Ok(config_path)
}

// NOTE: tauri::command couldn't use `&Config`
#[tauri::command]
pub fn write_config(app: AppHandle, config: Config) -> Result<(), String> {
    let config = err_log_to_string!(serde_json::to_string(&config))?;
    err_log_to_string!(std::fs::write(get_config_path(&app)?, config))
}

#[tauri::command]
pub fn read_config(app: AppHandle) -> Result<Config, String> {
    Ok(match read_to_string(get_config_path(&app)?) {
        Ok(content) => match serde_json::from_str(&content) {
            Ok(config) => config,
            Err(err) => {
                let err = format!("Failed to parse config: {err}");
                tracing::error!("{err}");
                Config::default()
            }
        },
        Err(err) => {
            let err = format!("Failed to read config: {err}");
            tracing::error!("{err}");
            Config::default()
        }
    })
}
