use std::pin::Pin;
use std::sync::atomic::Ordering;
use std::sync::Arc;
use std::time::Duration;
use std::{future::Future, sync::atomic::AtomicBool};

use anyhow::Result;
use once_cell::sync::Lazy;
use serde_json::{json, Value};
use tauri::async_runtime::JoinHandle;
use tauri::AppHandle;
use tokio::{
    sync::{mpsc, Mutex, OnceCell},
    time::interval,
};

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
                super::bluetooth::sys::get_bluetooth_info(instance_id.as_str());
            })
        },
        duration,
    )
    .await;

    if is_running_interval().await {
        let json_val = rx.recv().await.unwrap();
        return Ok(json_val);
    };
    Ok(json!(0))
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
