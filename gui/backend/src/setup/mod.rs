mod tray_menu;
mod window_event;

use self::tray_menu::new_tray_menu;
use self::window_event::window_event;
use crate::cmd::device_watcher::restart_device_watcher_inner;
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
            if let Ok(mut guard) = TRAY_ICON.lock() {
                if guard.is_none() {
                    guard.replace(new_tray_menu(app)?.build(app)?);
                };
            };
            let app = app.app_handle();
            restart_device_watcher_inner(app)?;
            Ok(())
        })
        .on_window_event(window_event)
    }
}
