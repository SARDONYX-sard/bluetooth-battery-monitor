// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod cmd;
mod error;
mod log;
mod setup;

use cmd::CommandsRegister as _;
use setup::SetupsRegister as _;
use tauri_plugin_window_state::StateFlags;

fn main() {
    #[allow(clippy::large_stack_frames)]
    if let Err(err) = tauri::Builder::default()
        .plugin(tauri_plugin_autostart::init(
            tauri_plugin_autostart::MacosLauncher::LaunchAgent,
            None,
        ))
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(
            // Avoid auto show(To avoid white flash screen): https://github.com/tauri-apps/plugins-workspace/issues/344
            tauri_plugin_window_state::Builder::default()
                .with_state_flags(StateFlags::all() & !StateFlags::VISIBLE)
                .build(),
        )
        .impl_setup()
        .impl_commands()
        .run(tauri::generate_context!())
    {
        tracing::error!("Error: {err}");
        std::process::exit(1);
    }
}

/// Result -> Log & toString
#[macro_export]
macro_rules! err_log_to_string {
    ($exp:expr) => {
        $exp.map_err(|err| {
            tracing::error!("{err}");
            err.to_string()
        })
    };
}

#[macro_export]
macro_rules! err_log {
    ($exp:expr) => {
        if let Err(err) = $exp {
            tracing::error!("{err}");
        }
    };
}
