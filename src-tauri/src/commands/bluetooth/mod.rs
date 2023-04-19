use anyhow::{Context, Result};
use serde_json::Value;
use tauri::AppHandle;

#[cfg(target_os = "windows")]
mod windows;
#[cfg(target_os = "windows")]
use self::windows as sys;

use crate::{commands::fs::bincode::write_data, system_tray::update_tray_icon};

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
            // We use `debug!` because we don't want to show it in `info!` for privacy reasons.
            debug!("Device_info Json: {}", device_json);
            Ok(device_json)
        }
        Err(err) => Err(err.into()),
    }
}

#[tauri::command]
pub async fn get_bluetooth_info_all() -> Result<Value, tauri::Error> {
    match sys::get_bluetooth_info_all() {
        Ok(devices_json) => {
            debug!("Devices_info Json: {}", devices_json);
            write_data("device_info", devices_json.clone());
            Ok(devices_json)
        }
        Err(err) => Err(err.into()),
    }
}

pub fn get_bluetooth_info_all_() -> Result<Value> {
    match sys::get_bluetooth_info_all() {
        Ok(devices_json) => {
            debug!("Devices_info Json: {}", devices_json);
            write_data("device_info", devices_json.clone());
            Ok(devices_json)
        }
        Err(err) => Err(err.into()),
    }
}
