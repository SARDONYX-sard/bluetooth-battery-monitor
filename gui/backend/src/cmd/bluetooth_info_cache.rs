use crate::err_log;
use bluetooth::BluetoothDeviceInfo;
use std::path::PathBuf;
use tauri::AppHandle;

fn get_cache_path(app: &AppHandle) -> Result<PathBuf, String> {
    let resolver = app.path_resolver();
    let cache_dir = &resolver.app_cache_dir().ok_or("Not found cache dir")?;
    let config_path = cache_dir.join(format!("{}_dev_cache.json", app.package_info().name));
    Ok(config_path)
}

#[tauri::command]
pub fn write_bt_cache(app: AppHandle, devices_json: &str) -> Result<(), String> {
    err_log!(std::fs::write(get_cache_path(&app)?, devices_json))
}

#[tauri::command]
pub fn read_bt_cache(app: AppHandle) -> Result<Vec<BluetoothDeviceInfo>, String> {
    let s = err_log!(std::fs::read_to_string(get_cache_path(&app)?))?;
    err_log!(serde_json::from_str(&s))
}
