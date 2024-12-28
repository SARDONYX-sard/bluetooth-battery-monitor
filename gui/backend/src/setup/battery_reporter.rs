use crate::cmd::battery_reporter::restart_interval;
use tauri::{AppHandle, Manager as _};

/// # Note
/// Interval callback fn cannot return Result. So relies on internal error log.
pub fn start_interval(app: &AppHandle) {
    let app = app.clone();
    let window = app.get_webview_window("main").unwrap();
    tauri::async_runtime::spawn(async move {
        let _ = restart_interval(window).await;
    });
}
