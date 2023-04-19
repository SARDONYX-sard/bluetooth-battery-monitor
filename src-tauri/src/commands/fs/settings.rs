/// This code was forked by sardonyx
/*
Copyright 2022 Justin Maximillian Kimlim and the Xplorer Contributors

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    https://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

///! Instead of using the bincode crate to keep the file size small,
///! allow users to directly configure the TOML itself by writing code.
use std::fs;
use std::path::{Path, PathBuf};
use std::str;
use tauri::api::path::local_data_dir;

use serde::{self, Deserialize, Serialize};
const DEFAULT_SETTINGS: &str = include_str!("../../../../assets/default_settings.toml");
const SETTINGS_FILE_NAME: &str = "settings.toml";

#[derive(Debug, Deserialize, Serialize)]
pub struct Settings {
    pub base: Base,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct Base {
    /// e.g. `true` Whether to start the app with the window on startup.
    pub autostart: bool,
    /// e.g. `60`(minutes) == 1hour
    pub battery_query_duration_minutes: u64,
    /// e.g. `20`(%)
    pub notify_battery_level: u8,
}

impl Default for Settings {
    fn default() -> Self {
        toml::from_str::<Settings>(DEFAULT_SETTINGS)
            .expect("Wrong syntaxes in default_settings.toml")
    }
}

#[derive(serde::Serialize, Debug)]
pub struct StorageData {
    pub data: serde_json::Value,
    pub status: bool,
}

fn get_storage_dir() -> PathBuf {
    Path::new(&local_data_dir().expect("Failed to get local dir."))
        .join("bluetooth-battery-monitor")
}

#[tauri::command]
pub fn write_settings(settings_obj: Settings) -> Result<(), StorageData> {
    let storage_dir = get_storage_dir();
    if let Err(e) = fs::create_dir_all(&storage_dir) {
        error!("Failed to create dirs: {:?}", e);
    }
    let toml_str = match toml::to_string(&settings_obj) {
        Ok(result) => result,
        Err(e) => {
            error!("Failed to convert to toml: {:?}", &settings_obj);
            return Err(StorageData {
                status: false,
                data: e.to_string().into(),
            });
        }
    };

    if let Err(e) = fs::write(storage_dir.join(SETTINGS_FILE_NAME), toml_str) {
        error!("Failed to write data: {:?}", e);
    };
    Ok(())
}

#[tauri::command]
pub fn read_settings() -> Result<Settings, String> {
    match fs::read(get_storage_dir().join(SETTINGS_FILE_NAME)) {
        Ok(result) => match toml::from_str::<Settings>(str::from_utf8(&result).unwrap()) {
            Ok(settings) => Ok(settings),
            Err(e) => Err(e.to_string()),
        },
        Err(e) => Err(e.to_string()),
    }
}

#[tauri::command]
pub fn delete_settings() {
    if fs::remove_file(get_storage_dir().join(SETTINGS_FILE_NAME)).is_ok() {}
}
