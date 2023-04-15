#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod commands;
mod system_tray;
mod utils;
mod window_menu;

#[macro_use]
extern crate log;

use serde_json::json;
use tauri::Manager;
use tauri_plugin_autostart::MacosLauncher;

use system_tray::{create_system_tray, tray_event};
use window_menu::{create_menu, menu_event};

use crate::commands::{
    storage::{read_data, write_data},
    timer::update_info_interval,
};

fn main() {
    env_logger::init();

    info!("Entering tauri builder");
    tauri::Builder::default()
        .plugin(tauri_plugin_autostart::init(
            MacosLauncher::LaunchAgent,
            None,
        ))
        .setup(|app| {
            let app = app.app_handle();
            let duration_item_name = "battery-query-duration-sec";
            let duration_minutes = 10 * 60;
            tauri::async_runtime::spawn(async move {
                let settings = match read_data("settings.json") {
                    Ok(storage) => match storage.status {
                        true => storage.data,
                        false => {
                            write_data(
                                "settings.json",
                                json!({ duration_item_name: duration_minutes }),
                            );
                            read_data("settings.json").unwrap().data
                        }
                    },
                    Err(err) => {
                        eprintln!("{}", err);
                        write_data(
                            "settings.json",
                            json!({ duration_item_name: duration_minutes }),
                        );
                        read_data("settings.json").unwrap().data
                    }
                };
                let duration_sec = settings
                    .get(duration_item_name)
                    .unwrap_or_else(|| {
                        panic!("Not found {duration_item_name} item in settings.json")
                    })
                    .as_u64()
                    .unwrap_or_else(|| {
                        panic!("wrong {duration_item_name} type. expected number(e.g. 10)")
                    });
                info!("duration time: {duration_sec}");
                update_info_interval(app, duration_sec).await;
            });
            Ok(())
        })
        .system_tray(create_system_tray())
        .on_system_tray_event(tray_event)
        .menu(create_menu())
        .on_menu_event(menu_event)
        .on_window_event(window_event)
        .invoke_handler(tauri::generate_handler![
            commands::bluetooth::get_bluetooth_info,
            commands::bluetooth::get_bluetooth_info_all,
            commands::timer::update_info_interval,
            commands::storage::read_data,
            commands::storage::write_data,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

fn window_event(event: tauri::GlobalWindowEvent) {
    if let tauri::WindowEvent::CloseRequested { api, .. } = event.event() {
        event.window().hide().expect("Failed to hide window.");
        let tray_toggle_window = event
            .window()
            .app_handle()
            .tray_handle()
            .get_item("toggle_window");
        tray_toggle_window
            .set_title("show")
            .expect("Couldn't set hide title in system tray");

        api.prevent_close();
    }
}
