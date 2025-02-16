use crate::exec_hidden_cmd;
use tauri::AppHandle;
use tauri_plugin_notification::NotificationExt as _;

/// # Info
/// Write to the log when an error occurs.
///
/// # Ref
/// - https://github.com/tauri-apps/plugins-workspace/tree/v2/plugins/notification
/// - https://zenn.dev/8beeeaaat/scraps/211b820f5c14d7
pub fn notify(app: &AppHandle, message: &str) -> Result<(), tauri_plugin_notification::Error> {
    // See: [[bug] No notification sound on Windows](https://github.com/tauri-apps/tauri/issues/6652)
    #[cfg(windows)]
    {
        crate::err_log!(exec_hidden_cmd("powershell.exe")
            .arg("[System.Media.SystemSounds]::Asterisk.Play()")
            .output());
    }
    app.notification()
        .builder()
        .title("[bluetooth battery monitor]")
        .body(message)
        .show()
}
