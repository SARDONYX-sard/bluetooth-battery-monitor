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

use system_tray::{create_system_tray, tray_event};
use window_menu::{create_menu, menu_event};

fn main() {
    env_logger::init();

    info!("Entering tauri builder");
    tauri::Builder::default()
        .system_tray(create_system_tray())
        .on_system_tray_event(tray_event)
        .menu(create_menu())
        .on_menu_event(menu_event)
        .on_window_event(window_event)
        .invoke_handler(tauri::generate_handler![
            commands::bluetooth::get_bluetooth_info,
            commands::bluetooth::get_bluetooth_info_all,
            commands::timer::update_info_interval,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

fn window_event(event: tauri::GlobalWindowEvent) {
    match event.event() {
        // tauri::WindowEvent::Focused(focused) => {
        //     // hide window whenever it loses focus
        //     if !focused {
        //         event.window().hide().unwrap();
        //     }
        // }
        tauri::WindowEvent::CloseRequested { api, .. } => {
            // let item_handle = api.tray_handle().get_item("toggle_window");
            event.window().hide().unwrap();
            api.prevent_close();
        }
        _ => {}
    }
}
