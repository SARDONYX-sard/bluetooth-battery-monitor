use super::battery_reporter::start_interval;
use crate::err_log;
use parse_display::{Display, FromStr};
use std::{str::FromStr, sync::Arc};
use tauri::{
    menu::{Menu, MenuItem},
    tray::{MouseButton, TrayIcon, TrayIconBuilder},
    AppHandle, Manager as _,
};

#[derive(Debug, Display, FromStr)]
enum MenuId {
    Reload,
    Show,
    Quit,
}

/// # Note
/// This function is called only at setup time.
pub fn new_tray_menu(app: &AppHandle) -> Result<TrayIcon, tauri::Error> {
    let none = None::<&str>;

    let reload_i = Arc::new(MenuItem::with_id(
        app,
        MenuId::Reload,
        "Reload",
        true,
        none,
    )?);
    let show_i = Arc::new(MenuItem::with_id(app, MenuId::Show, "Show", true, none)?);
    let quit_i = Arc::new(MenuItem::with_id(app, MenuId::Quit, "Exit", true, none)?);
    let menu = Menu::with_items(app, &[reload_i.as_ref(), show_i.as_ref(), quit_i.as_ref()])?;
    let cloned_show_i = Arc::clone(&show_i);

    TrayIconBuilder::new()
        .menu(&menu)
        .on_tray_icon_event(move |tray, event| {
            if let tauri::tray::TrayIconEvent::Click { button, .. } = event {
                if button != MouseButton::Left {
                    return;
                }

                let window = tray.app_handle().get_webview_window("main").unwrap();
                match window.is_visible() {
                    Ok(visible) => {
                        if visible {
                            let _ = err_log!(window.hide());
                            let _ = cloned_show_i.set_text("Show");
                        } else {
                            let _ = err_log!(window.show());
                            let _ = cloned_show_i.set_text("Hide");
                        }
                    }
                    Err(e) => {
                        tracing::error!("{e}");
                    }
                }
            }
        })
        .on_menu_event(move |app, event| {
            let event_id = MenuId::from_str(event.id.as_ref());
            if let Err(e) = event_id {
                tracing::error!("{e}");
                return;
            }

            match event_id.unwrap() {
                MenuId::Reload => start_interval(app),
                MenuId::Show => {
                    let window = app.get_webview_window("main").unwrap();
                    match window.is_visible() {
                        Ok(visible) => {
                            if visible {
                                let _ = err_log!(window.hide());
                                let _ = show_i.set_text("Show");
                            } else {
                                let _ = err_log!(window.show());
                                let _ = show_i.set_text("Hide");
                            }
                        }
                        Err(e) => {
                            tracing::error!("{e}");
                        }
                    }
                }
                MenuId::Quit => std::process::exit(0),
            };
        })
        .build(app)
}
