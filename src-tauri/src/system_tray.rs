use tauri::{AppHandle, CustomMenuItem, SystemTray, SystemTrayEvent, SystemTrayMenu};
use tauri::{Manager, SystemTrayMenuItem};

use crate::setup::setup_inner;

pub fn create_system_tray() -> SystemTray {
    let toggle_window = CustomMenuItem::new("toggle_window".to_string(), "Show");
    let update_info = CustomMenuItem::new("update_info".to_string(), "Update info");
    let quit = CustomMenuItem::new("quit".to_string(), "Quit");
    let tray_menu = SystemTrayMenu::new()
        .add_item(update_info)
        .add_native_item(SystemTrayMenuItem::Separator)
        .add_item(toggle_window)
        .add_item(quit);
    SystemTray::new().with_menu(tray_menu)
}

pub fn tray_event(app: &AppHandle, event: SystemTrayEvent) {
    match event {
        SystemTrayEvent::LeftClick {
            position: _,
            size: _,
            ..
        } => {
            info!("Left click");
        }
        SystemTrayEvent::RightClick {
            position: _,
            size: _,
            ..
        } => {
            info!("Right click");
        }
        SystemTrayEvent::DoubleClick {
            position: _,
            size: _,
            ..
        } => {
            info!("Double click");
        }
        SystemTrayEvent::MenuItemClick { id, .. } => match id.as_str() {
            "reload_info" => setup_inner(app),
            "toggle_window" => {
                let item_handle = app.tray_handle().get_item(&id);
                let window = app.get_window("main").unwrap();
                match window.is_visible().unwrap() {
                    true => {
                        window.hide().expect("Couldn't hide window");
                        item_handle.set_title("Show").expect("Couldn't set title");
                    }
                    false => {
                        window.show().expect("Couldn't show window");
                        item_handle.set_title("Hide").expect("Couldn't set title");
                    }
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
    debug!("Change to {} battery icon", battery_level);
    let battery_icon = match battery_level {
        0 => include_bytes!("../icons/battery/battery-0.png").to_vec(),
        1..=10 => include_bytes!("../icons/battery/battery-10.png").to_vec(),
        11..=20 => include_bytes!("../icons/battery/battery-20.png").to_vec(),
        21..=30 => include_bytes!("../icons/battery/battery-30.png").to_vec(),
        31..=40 => include_bytes!("../icons/battery/battery-40.png").to_vec(),
        41..=50 => include_bytes!("../icons/battery/battery-50.png").to_vec(),
        51..=60 => include_bytes!("../icons/battery/battery-60.png").to_vec(),
        61..=70 => include_bytes!("../icons/battery/battery-70.png").to_vec(),
        71..=80 => include_bytes!("../icons/battery/battery-80.png").to_vec(),
        81..=90 => include_bytes!("../icons/battery/battery-90.png").to_vec(),
        91..=100 => include_bytes!("../icons/battery/battery-100.png").to_vec(),
        _ => unreachable!(),
    };
    app.tray_handle()
        .set_icon(tauri::Icon::Raw(battery_icon))
        .unwrap();
}
