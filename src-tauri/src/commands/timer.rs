use std::time::Duration;

use serde_json::{json, Value};
use tauri::AppHandle;
use tokio::time;

use crate::commands::bluetooth;
use crate::system_tray::update_tray_icon;

#[tauri::command]
pub async fn update_info_interval(
    app: AppHandle,
    instance_id: &str,
    duration: u64,
) -> Result<Value, tauri::Error> {
    let mut res = json!(0);

    let instance_id = instance_id.to_owned();
    let mut interval = time::interval(Duration::from_secs(duration));
    loop {
        interval.tick().await;
        res = match bluetooth::get_bluetooth_info(instance_id.as_str()) {
            Ok(v) => {
                println!("{}", &v);
                let default_value = json!(0);
                let battery_level = v.get("battery_level").unwrap_or(&default_value);
                update_tray_icon(
                    &app.clone(),
                    battery_level.as_u64().expect("Failed to convert u64") as u8,
                )
                .await;
                break;
                v
            }
            Err(err) => json!({ "error": err }),
        };
    }
    Ok(res)
}
