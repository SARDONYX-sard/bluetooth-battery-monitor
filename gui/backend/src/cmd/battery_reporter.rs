use super::config::write_config;
use super::supports::{notify, update_tray};
use super::{config::read_config, find_bluetooth_devices};
use crate::err_log;
use std::{
    sync::atomic::{AtomicU64, Ordering},
    time::Duration,
};
use tauri::{Manager, Window};
use timer::{clear_interval, set_interval};

static INTERVAL_ID: AtomicU64 = AtomicU64::new(0);

/// # NOTE
/// The callback fn cannot return a Result, so write only error log.
#[tauri::command]
pub async fn restart_interval(window: Window) {
    tracing::trace!("`restart_interval` was called.");
    let id = INTERVAL_ID.load(Ordering::Acquire);
    if id != 0 {
        clear_interval(id).await;
    };

    let app = window.app_handle();
    let config = read_config(app.clone()).unwrap_or_else(|_| {
        let _ = err_log!(write_config(app.clone(), Default::default()));
        Default::default()
    });
    let duration = Duration::from_secs(config.battery_query_duration_minutes * 60); // minutes -> seconds

    let id = set_interval(
        move || {
            // Callbacks in the interval may survive until program termination in the worst case.
            // Therefore, they become 'static' and must be cloned.
            let app = app.clone();
            let instance_id = config.instance_id.clone();
            let window = window.clone();

            async move {
                // NOTE: The callback fn cannot return a Result, so write only error log.
                match find_bluetooth_devices().await {
                    Ok(devices) => {
                        for dev in &devices {
                            if instance_id.is_empty() {
                                if !dev.is_connected {
                                    continue;
                                }
                            } else if instance_id != dev.instance_id {
                                continue;
                            };

                            let battery_level = dev.battery_level;
                            if battery_level <= config.notify_battery_level {
                                let notify_msg = format!("Battery power is low: {battery_level}%");
                                let _ = err_log!(notify(&app, &notify_msg));
                            }

                            let dev_name = &dev.friendly_name;
                            let _ = err_log!(update_tray(&app, dev_name, battery_level).await);
                        }
                        if let Err(err) = window.emit("bt_monitor://restart_interval", devices) {
                            tracing::error!("{err}");
                        };
                    }
                    Err(e) => tracing::error!(e),
                };
            }
        },
        duration,
    )
    .await;

    INTERVAL_ID.store(id, Ordering::Release);
}
