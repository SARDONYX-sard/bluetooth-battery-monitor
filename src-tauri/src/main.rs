#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod commands;
mod setup;
mod system_tray;
mod utils;
mod window_menu;

#[macro_use]
extern crate log;

use tauri::Manager;
use tauri_plugin_autostart::MacosLauncher;

use setup::tauri_setup;
use system_tray::{create_system_tray, tray_event};
use window_menu::{create_menu, menu_event};

fn main() {
    env_logger::init();

    info!("Entering tauri builder");
    tauri::Builder::default()
        .plugin(tauri_plugin_autostart::init(
            MacosLauncher::LaunchAgent,
            None,
        ))
        .setup(tauri_setup)
        .system_tray(create_system_tray())
        .on_system_tray_event(tray_event)
        .menu(create_menu())
        .on_menu_event(menu_event)
        .on_window_event(window_event)
        .invoke_handler(tauri::generate_handler![
            commands::bluetooth::get_bluetooth_info,
            commands::bluetooth::get_bluetooth_info_all,
            commands::storage::delete_storage_data,
            commands::storage::read_data,
            commands::storage::write_data,
            commands::timer::update_info_interval,
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
