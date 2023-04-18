use tauri::{api::notification::Notification, AppHandle};

pub fn notify(app: &AppHandle, title: &str, message: &str) {
    // See: [[bug] No notification sound on Windows](https://github.com/tauri-apps/tauri/issues/6652)
    #[cfg(windows)]
    {
        use std::process::Command;
        Command::new("powershell.exe")
            .arg("[System.Media.SystemSounds]::Asterisk.Play()")
            .output()
            .expect("Failed to sound");
    }

    Notification::new(&app.config().tauri.bundle.identifier)
        .title(title)
        .body(message)
        .show()
        .expect("failed to show notification");
}
