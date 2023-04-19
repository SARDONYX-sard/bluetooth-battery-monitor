use std::pin::Pin;
use std::sync::{atomic::Ordering, Arc};
use std::time::Duration;
use std::{future::Future, sync::atomic::AtomicBool};

use once_cell::sync::Lazy;
use tauri::async_runtime::JoinHandle;
use tauri::AppHandle;
use tokio::sync::{Mutex, OnceCell};
use tokio::time::interval;

use crate::system_tray::update_tray_icon;

use super::bluetooth::get_bluetooth_info_all_;
use super::notify::notify;
use super::storage::read_data;

#[tauri::command]
pub async fn update_info_interval(app: AppHandle, duration_mins: u64) {
    let duration = Duration::from_secs(duration_mins * 60); // `* 60`: minutes to seconds

    clear_interval().await;

    set_interval(
        move || {
            let app = app.clone();
            let devices_info = get_bluetooth_info_all_()
                .expect("Parse error json")
                .as_array()
                .expect("Not found devices")
                .to_owned();
            let first_device = devices_info[0]
                .get("bluetooth_address")
                .expect("Not found 'bluetooth_address' key")
                .clone();
            Box::pin(async move {
                let selected_device_id = match read_data("selected_device_id") {
                    Ok(device) => match device.status {
                        true => device.data,
                        false => {
                            warn!("Not selected_device file. So fallback to first device.");
                            first_device
                        }
                    },
                    Err(err) => {
                        warn!("Not selected_device file.So fallback to first device: {err}");
                        first_device
                    }
                };
                info!("Selected device: {}", selected_device_id);
                let selected_device_info = devices_info
                    .iter()
                    .find(|device| device.get("bluetooth_address") == Some(&selected_device_id))
                    .expect("Not found selected device");
                let battery_level = selected_device_info
                    .get("battery_level")
                    .expect("Couldn't found battery level");
                let battery = battery_level.as_u64().unwrap();
                if battery <= 20 {
                    notify(
                        &app,
                        "[bluetooth battery monitor]",
                        format!("Configured battery warning.{}%", battery_level).as_str(),
                    );
                };
                update_tray_icon(&app, battery_level.as_u64().unwrap() as u8).await;
            })
        },
        duration,
    )
    .await;
}

// Define a struct to hold the state of the interval process
struct IntervalProcess {
    handle: Option<JoinHandle<()>>,
    running: Arc<AtomicBool>,
}

impl IntervalProcess {
    fn new() -> Self {
        Self {
            handle: None,
            running: Arc::new(AtomicBool::new(false)),
        }
    }

    // Start the interval process with the given callback and interval duration
    fn start<F, T>(&mut self, mut callback: F, duration: Duration)
    where
        F: FnMut() -> Pin<Box<dyn Future<Output = T> + Send + 'static>> + Send + 'static + Sync,
        T: std::fmt::Debug,
    {
        let running = self.running.clone();
        self.handle = Some(tauri::async_runtime::spawn(async move {
            let mut sleep_time = interval(duration);
            loop {
                sleep_time.tick().await;
                if !running.load(Ordering::Relaxed) {
                    break;
                }
                let res = callback().await;
                debug!("Interval callback  res: {:?}", res);
            }
        }));
        self.running.store(true, Ordering::Relaxed);
    }

    // Stop the interval process
    fn stop(&mut self) {
        self.running.store(false, Ordering::Relaxed);
        if let Some(handle) = self.handle.take() {
            tokio::spawn(async move {
                handle.abort();
            });
        }
    }
}

static INTERVAL_PROCESS: Lazy<OnceCell<Arc<Mutex<IntervalProcess>>>> = Lazy::new(OnceCell::new);

fn get_or_init_interval<'a>() -> impl Future<Output = &'a Arc<Mutex<IntervalProcess>>> {
    INTERVAL_PROCESS.get_or_init(|| async { Arc::new(Mutex::new(IntervalProcess::new())) })
}

// Define the setInterval and clearInterval functions
async fn set_interval<F, T>(callback: F, duration: Duration)
where
    F: FnMut() -> Pin<Box<dyn Future<Output = T> + Send + 'static>> + Send + 'static + Sync,
    T: std::fmt::Debug,
{
    get_or_init_interval()
        .await
        .lock()
        .await
        .start(callback, duration);
}

async fn clear_interval() {
    get_or_init_interval().await.lock().await.stop();
}

#[cfg(test)]
mod tests {
    use tokio::sync::mpsc;

    use super::*;

    async fn is_running_interval() -> bool {
        get_or_init_interval()
            .await
            .lock()
            .await
            .running
            .load(Ordering::Relaxed)
    }

    #[allow(clippy::bool_assert_comparison)]
    #[tokio::test]
    async fn test_interval_process() {
        let (tx, mut rx) = mpsc::channel(4);
        let send_array = [1, 2, 3, 4, 5];
        let mut i = 0;
        set_interval(
            move || {
                let tx = tx.clone();
                let val = send_array[i];
                i = (i + 1) % send_array.len();
                Box::pin(async move {
                    tx.send(val).await.unwrap();
                    info!("send: {}", val);
                })
            },
            Duration::from_secs(1),
        )
        .await;

        for expected_val in &send_array {
            let res_val = rx.recv().await.unwrap();
            info!("res: {}", res_val);
            assert_eq!(res_val, *expected_val);
        }

        assert!(is_running_interval().await);

        clear_interval().await;

        info!("Should have stopped the interval");
        assert_eq!(is_running_interval().await, false);
    }
}
