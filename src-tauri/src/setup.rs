use anyhow::Result;
use serde_json::json;
use std::error::Error;
use tauri::{App, Manager};

use crate::commands::{
    storage::{read_data, write_data},
    timer::update_info_interval,
};

pub fn tauri_setup(app: &mut App) -> Result<(), Box<(dyn Error + 'static)>> {
    let app = app.app_handle();
    let duration_item_name = "battery-query-duration-minutes";
    let default_duration_secs = 60 * 60; // 1 hour

    tauri::async_runtime::spawn(async move {
        let settings = match read_data("settings.json") {
            Ok(storage) => match storage.status {
                true => storage.data,
                false => {
                    write_data(
                        "settings.json",
                        json!({ duration_item_name: default_duration_secs }),
                    );
                    read_data("settings.json").unwrap().data
                }
            },
            Err(err) => {
                eprintln!("{}", err);
                write_data(
                    "settings.json",
                    json!({ duration_item_name: default_duration_secs }),
                );
                read_data("settings.json").unwrap().data
            }
        };
        let duration_secs = settings
            .get(duration_item_name)
            .unwrap_or_else(|| panic!("Not found {duration_item_name} item in settings.json"))
            .as_u64()
            .unwrap_or_else(|| panic!("wrong {duration_item_name} type. expected number(e.g. 10)"));

        info!("duration time: {duration_secs}");
        update_info_interval(app, duration_secs).await;
    });
    Ok(())
}
