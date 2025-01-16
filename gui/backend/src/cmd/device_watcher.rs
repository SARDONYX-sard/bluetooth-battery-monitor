use super::config::read_config;
use super::config::write_config;
use super::supports::notify::notify;
use super::system_tray::{default_tray_inner, update_tray_inner};
use crate::err_log;
use crate::err_log_to_string;
use crate::error::Error;
use bluetooth::device::windows::watch::Devices;
use bluetooth::device::windows::watch::Watcher;
use std::sync::{Arc, LazyLock, RwLock};
use tauri::{AppHandle, Emitter as _, Manager as _};

/// Device watcher singleton
pub static DEVICE_WATCHER: LazyLock<Arc<RwLock<Option<Watcher>>>> =
    LazyLock::new(|| Arc::new(RwLock::new(None)));

#[tauri::command]
pub async fn get_devices() -> Result<Devices, String> {
    let watcher = err_log_to_string!(DEVICE_WATCHER.read())?;
    Ok(watcher
        .as_ref()
        .map_or_else(Devices::new, |watcher| watcher.devices().clone()))
}

#[tauri::command]
pub async fn restart_device_watcher(app: AppHandle) -> Result<(), String> {
    err_log_to_string!(restart_device_watcher_inner(&app))
}

/// Reinitialize the DEVICE_WATCHER.
pub fn restart_device_watcher_inner(app: &AppHandle) -> crate::error::Result<()> {
    default_tray_inner()?;

    DEVICE_WATCHER
        .write()
        .map(|mut watcher| {
            let watcher_ = init_watcher(app);
            let _ = watcher_.stop();
            err_log!(watcher_.start());
            let devices = watcher_.devices();
            if let Some(Err(err)) = app
                .get_webview_window("main")
                .map(|window| window.emit("bt_monitor://update_devices", &devices))
            {
                tracing::error!("{err}");
            };

            *watcher = Some(watcher_);
            tracing::info!("Device watcher reinitialized.");
        })
        .map_err(|_| Error::FailedInitDeviceWatcher)?;

    Ok(())
}

fn init_watcher(app: &AppHandle) -> Watcher {
    let app = app.clone();
    match Watcher::new(move || update_devices(app.clone())) {
        Ok(watcher) => watcher,
        Err(err) => {
            let err = format!("Failed to start device watcher: {err}");
            tracing::error!("{err}");
            panic!("{err}");
        }
    }
}

/// # NOTE
/// The callback fn cannot return a Result, so write only error log.
fn update_devices(app: AppHandle) {
    let app = &app;

    let config = read_config(app.clone()).unwrap_or_else(|_| {
        err_log!(write_config(app.clone(), Default::default()));
        Default::default()
    });

    let watcher = match DEVICE_WATCHER.read() {
        Ok(watcher) => watcher,
        Err(err) => {
            tracing::error!("Failed to acquire read lock on DEVICE_WATCHER: {err}");
            return;
        }
    };
    let devices = {
        if let Some(watcher) = watcher.as_ref() {
            watcher.devices()
        } else {
            tracing::error!("Device watcher is not initialized.");
            return;
        }
    };

    if let Some(Err(err)) = app
        .get_webview_window("main")
        .map(|window| window.emit("bt_monitor://update_devices", devices))
    {
        tracing::error!("{err}");
    };

    if let Some(dev) = devices.get(&config.address) {
        if !dev.is_connected {
            return;
        };

        let battery_level = dev.battery_level;
        if battery_level <= config.notify_battery_level {
            let notify_msg = format!("Battery power is low: {battery_level}%");
            if let Err(err) = notify(app, &notify_msg) {
                tracing::error!("{err}");
            };
        }

        let dev_name = &dev.friendly_name;
        if let Err(err) = update_tray_inner(dev_name, battery_level) {
            tracing::error!("{err}");
        };
    };
}
