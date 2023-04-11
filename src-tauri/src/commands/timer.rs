use std::pin::Pin;
use std::sync::atomic::Ordering;
use std::sync::Arc;
use std::time::Duration;
use std::{future::Future, sync::atomic::AtomicBool};

use once_cell::sync::Lazy;
use serde_json::{json, Value};
use tauri::async_runtime::JoinHandle;
use tauri::AppHandle;
use tokio::{
    sync::{mpsc, Mutex, OnceCell},
    time::interval,
};

use crate::commands::bluetooth;
use crate::system_tray::update_tray_icon;

#[tauri::command]
pub async fn update_info_interval(
    app: AppHandle,
    instance_id: &str,
    duration: u64,
) -> Result<Value, tauri::Error> {
    let (tx, mut rx) = mpsc::channel(10);
    let duration = Duration::from_secs(duration); // milliseconds to seconds
    let instance_id = instance_id.to_owned();

    clear_interval().await;

    set_interval(
        move || {
            let instance_id = instance_id.clone();
            let app = app.clone();
            let tx = tx.clone();
            Box::pin(async move {
                match bluetooth::get_bluetooth_info(instance_id.as_str()) {
                    Ok(v) => {
                        println!("{}", &v);
                        let default_value = json!(0);
                        let battery_level = v.get("battery_level").unwrap_or(&default_value);
                        update_tray_icon(
                            &app.clone(),
                            battery_level.as_u64().expect("Failed to convert u64") as u8,
                        )
                        .await;
                        tx.send(v).await.unwrap();
                        // v
                    }
                    Err(err) => {
                        tx.send(json!({ "error": err })).await.unwrap();
                        // json!({ "error": err })
                    }
                };
            })
        },
        duration,
    )
    .await;

    async {
        loop {
            if is_running_interval().await {
                let json_val = rx.recv().await.unwrap();
                return Ok(json_val);
            } else {
                break;
            };
        }
        Ok(json!(0))
    }
    .await
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
    fn start<F, T>(&mut self, callback: F, duration: Duration)
    where
        F: Fn() -> Pin<Box<dyn Future<Output = T> + Send + 'static>> + Send + 'static + Sync,
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
                callback().await;
                // let t = callback().await;
                // println!("{:?}", t);
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

async fn is_running_interval() -> bool {
    get_or_init_interval()
        .await
        .lock()
        .await
        .running
        .load(Ordering::Relaxed)
}

// Define the setInterval and clearInterval functions
async fn set_interval<F, T>(callback: F, duration: Duration)
where
    F: Fn() -> Pin<Box<dyn Future<Output = T> + Send + 'static>> + Send + 'static + Sync,
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
