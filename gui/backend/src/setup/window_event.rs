use crate::err_log;

/// To prevent exit application by X button.
//
// # Note
// This signature is defined by a function that takes a function pointer as an argument and cannot return an error.
// Therefore, it should be logged by the logger.
pub fn window_event(event: tauri::GlobalWindowEvent) {
    use tauri::Manager as _;

    if let tauri::WindowEvent::CloseRequested { api, .. } = event.event() {
        let _ = err_log!(event.window().hide());
        let tray_toggle_window = event
            .window()
            .app_handle()
            .tray_handle()
            .get_item("toggle_window");
        let _ = err_log!(tray_toggle_window.set_title("show"));

        api.prevent_close();
    }
}
