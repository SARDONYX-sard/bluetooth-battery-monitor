use std::path::PathBuf;

use crate::err_log;
use tauri::AppHandle;

#[derive(Debug, serde::Deserialize, serde::Serialize)]
pub struct Config {
    /// e.g. `BTHENUM\\{0000111E-0000-1000-8000-00805F9B34FB}_LOCALMFG&005D...`
    pub instance_id: String,

    /// e.g. `60`(minutes) == 1hour
    pub battery_query_duration_minutes: u64,

    /// e.g. `20`(%)
    pub notify_battery_level: u64,
}

impl Default for Config {
    fn default() -> Self {
        Self {
            instance_id: Default::default(),
            battery_query_duration_minutes: 60,
            notify_battery_level: 20,
        }
    }
}

fn get_config_path(app: &AppHandle) -> Result<PathBuf, String> {
    let resolver = app.path_resolver();
    let config_dir = &resolver.app_config_dir().ok_or("Not found config dir")?;
    let config_path = config_dir.join(format!("{}_config.json", app.package_info().name));
    Ok(config_path)
}

#[tauri::command]
pub fn write_config(app: AppHandle, config: Config) -> Result<(), String> {
    let config = err_log!(serde_json::to_string(&config))?;
    err_log!(std::fs::write(get_config_path(&app)?, config))
}

#[tauri::command]
pub fn read_config(app: AppHandle) -> Result<Config, String> {
    let content = err_log!(std::fs::read_to_string(get_config_path(&app)?))?;
    err_log!(serde_json::from_str(&content))
}
