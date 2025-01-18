use super::config::read_config;
use super::config::write_config;
use super::supports::notify::notify;
use super::system_tray::{default_tray_inner, update_tray_inner};
use crate::err_log;
use crate::err_log_to_string;
use crate::error::Error;
use bluetooth::device::device_info::Devices;
use bluetooth::device::windows::watch::Watcher;
use bluetooth::device::windows::watch::DEVICES;
use std::sync::Mutex;
use tauri::{AppHandle, Emitter as _, Manager as _};

/// Device watcher singleton
pub static DEVICE_WATCHER: Mutex<Option<Watcher>> = Mutex::new(None);

#[tauri::command]
pub async fn get_devices() -> Devices {
    DEVICES.as_ref().clone()
}

#[tauri::command]
pub async fn restart_device_watcher(app: AppHandle) -> Result<(), String> {
    err_log_to_string!(restart_device_watcher_inner(&app).await)
}

/// Reinitialize the DEVICE_WATCHER.
pub async fn restart_device_watcher_inner(app: &AppHandle) -> crate::error::Result<()> {
    tracing::info!("Try to reinitialize device watcher.");
    default_tray_inner().await?;

    DEVICE_WATCHER
        .lock()
        .map(|mut watcher| {
            let new_watcher = init_watcher(app);

            if let Some(Err(err)) = app
                .get_webview_window("main")
                .map(|window| window.emit("bt_monitor://update_devices", DEVICES.as_ref()))
            {
                tracing::error!("{err}");
            };

            // let _ = watcher.as_ref().map(|watcher| watcher.stop());
            // err_log!(DEVICE_WATCHER
            //     .lock()
            //     .map(|watcher| watcher.as_ref().map(|w| w.start())));
            err_log!(new_watcher.start());
            *watcher = Some(new_watcher);
            tracing::info!("Device watcher reinitialized.");
        })
        .map_err(|_| Error::FailedInitDeviceWatcher)?;

    Ok(())
}

fn init_watcher(app: &AppHandle) -> Watcher {
    let app = app.clone();
    match Watcher::new(move || update_devices(&app)) {
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
fn update_devices(app: &AppHandle) {
    tracing::info!("Device watcher update event");
    let config = read_config(app.clone()).unwrap_or_else(|_| {
        err_log!(write_config(app.clone(), Default::default()));
        Default::default()
    });

    if let Err(err) = app
        .get_webview_window("main")
        .unwrap()
        .emit("bt_monitor://update_devices", DEVICES.as_ref())
    {
        tracing::error!("{err}");
    };

    if let Some(dev) = DEVICES.as_ref().get(&config.address) {
        let friendly_name = &dev.friendly_name;
        let battery_level = dev.battery_level as u64;
        err_log!(update_tray_inner(friendly_name, battery_level));

        if dev.is_connected && battery_level <= config.notify_battery_level {
            let notify_msg = format!("Battery power is low: {battery_level}%");
            err_log!(notify(app, &notify_msg));
        };
    } else {
        tracing::warn!("not found address: {}", config.address);
    };
}
