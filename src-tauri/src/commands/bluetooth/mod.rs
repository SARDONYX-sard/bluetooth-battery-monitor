use serde_json::Value;

#[cfg(target_os = "windows")]
mod windows;
#[cfg(target_os = "windows")]
use self::windows as sys;

use super::storage::write_data;

#[tauri::command(async)]
pub fn get_bluetooth_info(instance_id: &str) -> Result<Value, String> {
    let v = sys::get_bluetooth_info(instance_id);
    match v {
        Ok(v) => {
            write_data("device_info", v.clone());
            Ok(v)
        }
        Err(err) => Err(err.to_string()),
    }
}

#[tauri::command(async)]
pub fn get_bluetooth_info_all() -> Result<Value, String> {
    let v = sys::get_bluetooth_info_all();
    match v {
        Ok(v) => {
            write_data("device_info", v.clone());
            Ok(v)
        }
        Err(err) => Err(err.to_string()),
    }
}
