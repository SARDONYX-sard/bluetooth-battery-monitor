use crate::cmd::battery_reporter::restart_interval;

/// # Note
/// Interval callback fn cannot return Result. So relies on internal error log.
pub fn start_interval(app: &tauri::AppHandle) {
    let app = app.clone();
    tauri::async_runtime::spawn(async move {
        let _ = restart_interval(app).await;
    });
}
