use super::battery_reporter::start_interval;
use tauri::{AppHandle, Manager as _, SystemTray, SystemTrayEvent};

const RELOAD_ID: &str = "reload_info";
const TOGGLE_WINDOW_ID: &str = "toggle_window";
const EXIT_ID: &str = "quit";

/// # Note
/// This function is called only at setup time.
pub fn create_system_tray() -> SystemTray {
    use tauri::{CustomMenuItem, SystemTrayMenu, SystemTrayMenuItem};

    let reload_info = CustomMenuItem::new(RELOAD_ID, "Reload");
    let toggle_window = CustomMenuItem::new(TOGGLE_WINDOW_ID, "Show");
    let quit = CustomMenuItem::new(EXIT_ID, "Exit");

    let tray_menu = SystemTrayMenu::new()
        .add_item(reload_info)
        .add_native_item(SystemTrayMenuItem::Separator)
        .add_item(toggle_window)
        .add_item(quit);
    SystemTray::new()
        .with_menu(tray_menu)
        .with_tooltip("Getting bluetooth battery...")
}

/// # Note
/// This function is called only at setup time.
pub fn tray_event(app: &AppHandle, event: SystemTrayEvent) {
    match event {
        SystemTrayEvent::LeftClick { .. } => {
            let item_handle = app.tray_handle().get_item("toggle_window");
            let window = app.get_window("main").unwrap();

            match window.is_visible() {
                Ok(visible) => {
                    if let Err(e) = if visible {
                        window.hide().expect("Couldn't hide window");
                        item_handle.set_title("Show")
                    } else {
                        window.show().expect("Couldn't show window");
                        item_handle.set_title("Hide")
                    } {
                        tracing::error!("{e}");
                    };
                }
                Err(e) => {
                    tracing::error!("{e}");
                }
            }
        }
        SystemTrayEvent::MenuItemClick { id, .. } => match id.as_str() {
            RELOAD_ID => start_interval(app),
            TOGGLE_WINDOW_ID => {
                let item_handle = app.tray_handle().get_item(&id);
                let window = app.get_window("main").unwrap();

                match window.is_visible() {
                    Ok(visible) => {
                        if let Err(e) = if visible {
                            window.hide().expect("Couldn't hide window");
                            item_handle.set_title("Show")
                        } else {
                            window.show().expect("Couldn't show window");
                            item_handle.set_title("Hide")
                        } {
                            tracing::error!("{e}");
                        };
                    }
                    Err(e) => {
                        tracing::error!("{e}");
                    }
                }
            }
            EXIT_ID => {
                std::process::exit(0);
            }
            _ => tracing::error!("Unknown event id: {id}"),
        },
        _ => (),
    }
}
