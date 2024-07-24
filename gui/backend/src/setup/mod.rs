mod battery_reporter;
pub mod logger;
mod system_tray;
mod window_event;

pub use logger::LOG_INSTANCE; // Need cmd

use battery_reporter::start_interval;
use system_tray::{create_system_tray, tray_event};
use tauri::{Builder, Wry};

pub(crate) trait SetupsRegister {
    /// Implements custom setup.
    fn impl_setup(self) -> Self;
}

impl SetupsRegister for Builder<Wry> {
    fn impl_setup(self) -> Self {
        self.setup(|app| {
            logger::init_logger(app)?;
            start_interval(&app.handle());
            Ok(())
        })
        .system_tray(create_system_tray())
        .on_system_tray_event(tray_event)
        .on_window_event(window_event::window_event)
    }
}
