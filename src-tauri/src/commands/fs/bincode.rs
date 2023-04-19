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

use std::fs;
use std::path::{Path, PathBuf};
use std::str;
use tauri::api::path::local_data_dir;

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
pub fn write_data(key: &str, value: serde_json::Value) {
    let storage_dir = get_storage_dir();
    if let Err(e) = fs::create_dir_all(&storage_dir) {
        error!("Failed to create dirs: {:?}", e);
    }
    let value = bincode::serialize(&serde_json::to_vec(&value).unwrap()).unwrap();

    if let Err(e) = fs::write(storage_dir.join(key), value) {
        error!("Failed to write data: {:?}", e);
    }
}

#[tauri::command]
pub fn read_data(key: &str) -> Result<StorageData, String> {
    let storage_dir = get_storage_dir();
    let mut status = true;
    let data: String;
    match fs::read(storage_dir.join(key)) {
        Ok(result) => match bincode::deserialize(&result) {
            Ok(deserialized_bincode) => data = deserialized_bincode,
            Err(_) => data = str::from_utf8(&result).unwrap().to_string(),
        },
        Err(e) => {
            status = false;
            data = e.to_string();
        }
    }

    let serde_value: Result<serde_json::Value, serde_json::Error> = serde_json::from_str(&data);
    let data = match serde_value {
        Ok(result) => result,
        Err(_) => {
            status = false;
            serde_json::Value::Null
        }
    };

    Ok(StorageData { data, status })
}

#[tauri::command]
pub fn delete_storage_data(key: String) {
    let storage_dir = get_storage_dir();

    if fs::remove_file(storage_dir.join(key)).is_ok() {}
}
