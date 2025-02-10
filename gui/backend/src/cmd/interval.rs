/// # Why need this code?
/// DeviceWatcher triggers when a device is connected or disconnected, but cannot WATCH DEVPKEY for battery information.
/// ThatFor this reason, it is currently not possible to use the ITherefore, it is currently using interval processing.
use super::config::{read_config, write_config_sync};
use crate::cmd::supports::notify;
use crate::cmd::system_tray::update_tray_inner;
use crate::err_log;
use bluetooth::device::windows::{device_info::get_bluetooth_devices, watch::DEVICES};
use std::{
    sync::atomic::{AtomicU64, Ordering},
    time::Duration,
};
use tauri::{AppHandle, Emitter as _, Manager as _};
use timer::{clear_interval, set_interval};

/// The task is singleton.
static INTERVAL_ID: AtomicU64 = AtomicU64::new(0);

/// # NOTE
/// The callback fn cannot return a Result, so write only error log.
#[tauri::command]
pub async fn restart_interval(app: AppHandle) {
    tracing::debug!("`restart_interval` was called.");
    let id = INTERVAL_ID.load(Ordering::Acquire);
    if id != 0 {
        clear_interval(id).await;
    };

    let config = read_config(app.clone()).await.unwrap_or_else(|_| {
        err_log!(write_config_sync(app.clone(), Default::default()));
        Default::default()
    });
    let duration = Duration::from_secs(config.battery_query_duration_minutes * 60); // minutes -> seconds

    let id = set_interval(
        move || {
            tracing::debug!("`restart_interval` closure was called.");

            let app = app.clone();
            let address = config.address;

            async move {
                // NOTE: The callback fn cannot return a Result, so write only error log.
                let devices = match get_bluetooth_devices() {
                    Ok(devices) => devices,
                    Err(err) => {
                        tracing::error!("{err}");
                        return;
                    }
                };

                if let Some(dev) = devices.get(&address) {
                    let battery_level = dev.battery_level as u64;
                    if battery_level <= config.notify_battery_level {
                        let notify_msg = format!("Battery power is low: {battery_level}%");
                        err_log!(notify::notify(&app, &notify_msg));
                    }

                    let dev_name = &dev.friendly_name;
                    err_log!(update_tray_inner(
                        dev_name,
                        battery_level,
                        dev.is_connected,
                        config.icon_type
                    ));
                };

                let window = if let Some(window) = app.get_webview_window("main") {
                    window
                } else {
                    tracing::error!("GUI `main` windows is not found!");
                    return;
                };
                err_log!(window.emit("bt_monitor://restart_devices", &devices));

                // Replace all
                for (address, device) in devices {
                    if let Some(mut value) = DEVICES.get_mut(&address) {
                        *value.value_mut() = device;
                    }
                }
            }
        },
        duration,
    )
    .await;

    INTERVAL_ID.store(id, Ordering::Release);
}
