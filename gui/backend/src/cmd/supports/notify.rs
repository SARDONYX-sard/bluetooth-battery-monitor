use tauri::{api::notification::Notification, AppHandle};

/// # Info
/// Write to the log when an error occurs.
///
/// # Note
/// Need feature [`notification-all`](https://tauri.app/v1/api/js/notification/)
pub fn notify(app: &AppHandle, message: &str) -> tauri::Result<()> {
    Ok(Notification::new(&app.config().tauri.bundle.identifier)
        .title("[bluetooth battery monitor]")
        .body(message)
        .show()?)
}
