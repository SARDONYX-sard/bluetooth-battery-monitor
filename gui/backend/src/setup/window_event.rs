use crate::err_log;
use tauri::{Runtime, Window, WindowEvent};

/// To prevent exit application by X button.
///
/// # Note
/// This signature is defined by a function that takes a function pointer as an argument and cannot return an error.
/// Therefore, it should be logged by the logger.
pub fn window_event<R: Runtime>(window: &Window<R>, event: &WindowEvent) {
    if let tauri::WindowEvent::CloseRequested { api, .. } = event {
        err_log!(window.hide());
        api.prevent_close();
    }
}
