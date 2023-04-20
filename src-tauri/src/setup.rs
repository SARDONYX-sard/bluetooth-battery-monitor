use anyhow::Result;
use std::error::Error;
use tauri::{App, AppHandle, Manager};

use crate::commands::{
    fs::settings::{read_settings, write_settings, Settings},
    timer::update_info_interval,
};

pub fn tauri_setup(app: &mut App) -> Result<(), Box<(dyn Error + 'static)>> {
    setup_inner(&app.app_handle());
    Ok(())
}

pub fn setup_inner(app: &AppHandle) {
    let app = app.clone();
    tauri::async_runtime::spawn(async move {
        let settings = read_settings().unwrap_or_else(|err| {
            error!("Fallback to default settings. Reason: {err}");
            write_settings(Settings::default()).expect("Failed to write default settings");
            Settings::default()
        });
        let duration_mins = settings.base.battery_query_duration_minutes;
        info!("duration minutes: {duration_mins}");
        update_info_interval(app, duration_mins).await;
    });
}
