// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
mod cmd;
mod setup;

pub(crate) use setup::LOG_INSTANCE;

use anyhow::Context as _;
use cmd::CommandsRegister;
use setup::SetupsRegister as _;

fn main() -> std::io::Result<()> {
    tauri::Builder::default()
        .impl_setup()
        .impl_commands()
        .plugin(tauri_plugin_autostart::init(
            tauri_plugin_autostart::MacosLauncher::LaunchAgent,
            None,
        ))
        .run(tauri::generate_context!())
        .context("Failed to execute tauri")
        .map_err(|err| {
            tracing::error!("Error: {err}");
            std::process::exit(1);
        })
}

/// Result -> Log & toString
#[macro_export]
macro_rules! err_log {
    ($exp:expr) => {
        $exp.map_err(|err| {
            tracing::error!("{err}");
            err.to_string()
        })
    };
}
