use anyhow::{Context, Result};
use serde_json::Value;
use tauri::AppHandle;

#[cfg(target_os = "windows")]
pub mod windows;
#[cfg(target_os = "windows")]
pub use self::windows as sys;

use super::storage::write_data;
use crate::system_tray::update_tray_icon;

#[tauri::command]
pub async fn get_bluetooth_info(app: AppHandle, instance_id: &str) -> Result<Value, tauri::Error> {
    match sys::get_bluetooth_info(instance_id) {
        Ok(device_json) => {
            let battery_json = device_json
                .get("battery_level")
                .expect("Couldn't get battery_level");
            let battery_level = battery_json
                .as_u64()
                .with_context(|| format!("Failed to convert :{:?}", battery_json))
                .unwrap() as u8;
            update_tray_icon(&app.clone(), battery_level).await;
            write_data("device_info", device_json.clone());
            debug!("Device_info Json: {}", device_json);
            Ok(device_json)
        }
        Err(err) => Err(err.into()),
    }
}

#[tauri::command(async)]
pub fn get_bluetooth_info_all() -> Result<Value, String> {
    let v = sys::get_bluetooth_info_all();
    match v {
        Ok(v) => {
            write_data("device_info", v.clone());
            debug!("Device_info all Json: {}", v);
            Ok(v)
        }
        Err(err) => Err(err.to_string()),
    }
}
