mod tray_menu;
mod window_event;

use self::tray_menu::new_tray_menu;
use self::window_event::window_event;
use crate::{
    cmd::{device_watcher::restart_device_watcher_inner, interval::restart_interval},
    err_log,
};
use tauri::{Builder, Manager, Wry};
pub use tray_menu::TRAY_ICON;

pub(crate) trait SetupsRegister {
    /// Implements custom setup.
    fn impl_setup(self) -> Self;
}

impl SetupsRegister for Builder<Wry> {
    fn impl_setup(self) -> Self {
        self.setup(|app| {
            crate::log::init(app)?;

            let app = app.app_handle();
            new_tray_menu(app)?;
            let app = app.clone();
            tauri::async_runtime::spawn(async move {
                let app = app;
                err_log!(restart_device_watcher_inner(&app).await);
                restart_interval(app).await;
            });

            Ok(())
        })
        .on_window_event(window_event)
    }
}
