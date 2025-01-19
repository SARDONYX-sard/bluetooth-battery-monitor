use crate::{cmd::device_watcher::restart_device_watcher_inner, err_log};
use parse_display::{Display, FromStr};
use std::{
    process::Command,
    str::FromStr,
    sync::{Arc, Mutex},
};
use tauri::{
    menu::{Menu, MenuItem},
    tray::{MouseButton, MouseButtonState, TrayIcon, TrayIconBuilder},
    AppHandle, Manager as _,
};

pub static TRAY_ICON: Mutex<Option<TrayIcon>> = Mutex::new(None);

#[derive(Debug, Display, FromStr)]
enum MenuId {
    Reload,
    Show,
    Quit,
    BtOsMenu,
}

/// # Note
/// This function is called only at setup time.
pub fn new_tray_menu(app: &AppHandle<tauri::Wry>) -> Result<(), tauri::Error> {
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
    let os_menu_i = Arc::new(MenuItem::with_id(
        app,
        MenuId::BtOsMenu,
        "Bluetooth Settings(OS)",
        true,
        none,
    )?);
    let menu = Menu::with_items(
        app,
        &[
            reload_i.as_ref(),
            show_i.as_ref(),
            os_menu_i.as_ref(),
            quit_i.as_ref(),
        ],
    )?;
    let cloned_show_i = Arc::clone(&show_i);

    let tray = TrayIconBuilder::new()
        .show_menu_on_left_click(false)
        .menu(&menu)
        .on_tray_icon_event(move |tray, event| {
            if let tauri::tray::TrayIconEvent::Click {
                button: MouseButton::Left,
                button_state: MouseButtonState::Up,
                ..
            } = event
            {
                let window = tray.app_handle().get_webview_window("main").unwrap();
                match window.is_visible() {
                    Ok(visible) => {
                        if visible {
                            err_log!(window.hide());
                            let _ = cloned_show_i.set_text("Show");
                        } else {
                            err_log!(window.show());
                            let _ = cloned_show_i.set_text("Hide");
                        }
                    }
                    Err(e) => {
                        tracing::error!("{e}");
                    }
                }
            }
        })
        .on_menu_event(
            move |app, event| match MenuId::from_str(event.id.as_ref()) {
                Ok(event_id) => match event_id {
                    MenuId::Reload => {
                        let app = app.clone();
                        tauri::async_runtime::spawn(async move {
                            let app = app;
                            err_log!(restart_device_watcher_inner(&app).await);
                        });
                    }
                    MenuId::Show => {
                        let window = app.get_webview_window("main").unwrap();
                        match window.is_visible() {
                            Ok(visible) => {
                                if visible {
                                    err_log!(window.hide());
                                    let _ = show_i.set_text("Show");
                                } else {
                                    err_log!(window.show());
                                    let _ = show_i.set_text("Hide");
                                }
                            }
                            Err(e) => tracing::error!("{e}"),
                        };
                    }
                    MenuId::BtOsMenu => {
                        err_log!(Command::new("cmd")
                            .args(["/c", "start", "ms-settings:bluetooth"])
                            .output());
                    }
                    MenuId::Quit => std::process::exit(0),
                },
                Err(e) => tracing::error!("{e}"),
            },
        )
        .build(app)?;

    if let Ok(mut guard) = TRAY_ICON.lock() {
        let _ = guard.get_or_insert(tray);
    };

    Ok(())
}
