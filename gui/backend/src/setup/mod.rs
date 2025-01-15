mod battery_reporter;
mod system_tray;
mod window_event;

use self::battery_reporter::start_interval;
use self::system_tray::new_tray_menu;
use self::window_event::window_event;
use tauri::{Builder, Manager, Wry};

pub(crate) trait SetupsRegister {
    /// Implements custom setup.
    fn impl_setup(self) -> Self;
}

impl SetupsRegister for Builder<Wry> {
    fn impl_setup(self) -> Self {
        self.setup(|app| {
            crate::log::init(app)?;
            new_tray_menu(app.app_handle())?;
            start_interval(app.handle());
            Ok(())
        })
        .on_window_event(window_event)
    }
}
