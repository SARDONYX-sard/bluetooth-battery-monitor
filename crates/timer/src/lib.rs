use std::sync::{
    atomic::{AtomicU64, Ordering},
    Arc,
};
use std::time::Duration;
use std::{future::Future, sync::atomic::AtomicBool};

use dashmap::DashMap;
use once_cell::sync::Lazy;
use tokio::spawn;
use tokio::task::JoinHandle;
use tokio::time::interval;

/// Represents a process that executes a callback function at regular intervals.
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

    /// Starts the interval process with the given callback and interval duration.
    fn start<F, Fut>(&mut self, mut callback: F, duration: Duration)
    where
        F: FnMut() -> Fut + Send + 'static + Sync,
        Fut: Future<Output = ()> + Send + 'static + Sync,
    {
        let running = self.running.clone();
        self.handle = Some(spawn(async move {
            let mut sleep_time = interval(duration);
            loop {
                sleep_time.tick().await;
                if !running.load(Ordering::Relaxed) {
                    break;
                }
                callback().await;
            }
        }));
        self.running.store(true, Ordering::Relaxed);
    }

    /// Stops the interval process.
    fn stop(&mut self) {
        self.running.store(false, Ordering::Relaxed);
        if let Some(handle) = self.handle.take() {
            tokio::spawn(async move {
                handle.abort();
            });
        }
    }
}

static INTERVAL_PROCESSES: Lazy<DashMap<u64, IntervalProcess>> = Lazy::new(DashMap::new);
static NEXT_ID: AtomicU64 = AtomicU64::new(1);

/// Registers a callback function to be executed at the specified interval duration.
/// Returns a unique ID for the registered interval.
pub async fn set_interval<F, Fut>(callback: F, duration: Duration) -> u64
where
    F: FnMut() -> Fut + Send + 'static + Sync,
    Fut: Future<Output = ()> + Send + 'static + Sync,
{
    let id = NEXT_ID.fetch_add(1, Ordering::Relaxed);
    let mut interval_process = IntervalProcess::new();
    interval_process.start(callback, duration);
    INTERVAL_PROCESSES.insert(id, interval_process);
    id
}

/// Stops the interval process associated with the given ID.
pub async fn clear_interval(id: u64) {
    if let Some(mut interval_process) = INTERVAL_PROCESSES.remove(&id).map(|e| e.1) {
        interval_process.stop();
    }
}

/// Is running interval process?
pub async fn is_running_interval(id: u64) -> bool {
    INTERVAL_PROCESSES
        .get(&id)
        .is_some_and(|process| process.running.load(Ordering::Relaxed))
}

#[cfg(test)]
mod tests {
    use crate::{clear_interval, is_running_interval, set_interval};
    use std::time::Duration;
    use tokio::sync::mpsc;

    #[tokio::test]
    #[quick_tracing::try_init]
    async fn test_interval_process() -> std::io::Result<()> {
        let (tx, mut rx) = mpsc::channel(4);
        let send_array = [1, 2, 3, 4, 5];

        let mut index = 0;
        let id = set_interval(
            move || {
                let tx = tx.clone();
                let val = send_array[index];
                index = index.wrapping_add(1);
                async move {
                    tracing::trace!("try send: {val}");

                    if let Err(e) = tx.send(val).await {
                        tracing::error!("{e}");
                    };
                }
            },
            Duration::from_secs(1),
        )
        .await;

        for expected_val in &send_array {
            let res_val = rx.recv().await.unwrap();

            tracing::trace!(res_val);
            assert_eq!(res_val, *expected_val);
        }

        assert!(is_running_interval(id).await);
        clear_interval(id).await;
        assert!(!is_running_interval(id).await);
        Ok(())
    }
}
