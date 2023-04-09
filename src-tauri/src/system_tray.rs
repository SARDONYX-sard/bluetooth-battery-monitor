use tauri::Manager;
use tauri::{AppHandle, CustomMenuItem, SystemTray, SystemTrayEvent, SystemTrayMenu};

pub fn create_system_tray() -> SystemTray {
    let toggle_window = CustomMenuItem::new("toggle_window".to_string(), "Show");
    let quit = CustomMenuItem::new("quit".to_string(), "Quit");
    let tray_menu = SystemTrayMenu::new().add_item(toggle_window).add_item(quit);
    SystemTray::new().with_menu(tray_menu)
}

pub fn tray_event(app: &AppHandle, event: SystemTrayEvent) {
    match event {
        SystemTrayEvent::LeftClick {
            position: _,
            size: _,
            ..
        } => {
            println!("system tray received a left click");
        }
        SystemTrayEvent::RightClick {
            position: _,
            size: _,
            ..
        } => {
            println!("system tray received a right click");
        }
        SystemTrayEvent::DoubleClick {
            position: _,
            size: _,
            ..
        } => {
            println!("system tray received a double click");
        }
        SystemTrayEvent::MenuItemClick { id, .. } => match id.as_str() {
            "toggle_window" => {
                let item_handle = app.tray_handle().get_item(&id);
                let window = app.get_window("main").unwrap();

                if window.is_visible().unwrap() {
                    window.hide().unwrap();
                    item_handle.set_title("Show").unwrap();
                } else {
                    window.show().unwrap();
                    item_handle.set_title("Hide").unwrap();
                }
            }
            "quit" => {
                std::process::exit(0);
            }
            _ => {}
        },
        _ => {}
    }
}

pub async fn update_tray_icon(app: &AppHandle, battery_level: u8) {
    println!("Enter change icon");
    match battery_level {
        1..=25 => {
            app.tray_handle()
                .set_icon(tauri::Icon::Raw(
                    include_bytes!("../icons/battery/Graphicloads-100-Flat-2-Battery-low.256.png")
                        .to_vec(),
                ))
                .unwrap();
        }
        26..=50 => {
            app.tray_handle()
                .set_icon(tauri::Icon::Raw(
                    include_bytes!("../icons/battery/Graphicloads-100-Flat-2-Battery-half.256.png")
                        .to_vec(),
                ))
                .unwrap();
        }
        51..=100 => {
            println!("change to full icon");
            app.tray_handle()
                .set_icon(tauri::Icon::Raw(
                    include_bytes!("../icons/battery/Graphicloads-100-Flat-2-Battery-full.256.png")
                        .to_vec(),
                ))
                .unwrap();
        }
        _ => unreachable!(),
    }
}
