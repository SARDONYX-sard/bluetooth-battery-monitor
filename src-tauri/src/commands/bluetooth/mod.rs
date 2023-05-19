use anyhow::Result;
use serde_json::Value;
use tauri::AppHandle;

use crate::bluetooth::sys;
use crate::{commands::fs::bincode::write_data, system_tray::update_tray_icon};

#[tauri::command]
pub async fn get_bluetooth_info(app: AppHandle, instance_id: &str) -> Result<Value, tauri::Error> {
    match sys::get_bluetooth_info(instance_id) {
        Ok(device_json) => {
            let battery_level = device_json
                .get("battery_level")
                .expect("Not found battery_level.")
                .as_u64()
                .expect("Couldn't covert to u64");

            let device_name = device_json
                .get("device_name")
                .expect("Couldn't find device")
                .as_str()
                .unwrap_or_default();

            update_tray_icon(&app.clone(), device_name, battery_level)
                .await
                .err();
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
    match get_bluetooth_info_all_inner() {
        Ok(devices_json) => Ok(devices_json),
        Err(err) => Err(err.into()),
    }
}

/// This function exists to separate sync and async.
fn get_bluetooth_info_all_inner() -> Result<Value, serde_json::Error> {
    match sys::get_bluetooth_info_all() {
        Ok(devices_json) => {
            debug!("Devices_info Json: {}", devices_json);
            write_data("device_info", devices_json.clone());
            Ok(devices_json)
        }
        Err(err) => Err(err),
    }
}
