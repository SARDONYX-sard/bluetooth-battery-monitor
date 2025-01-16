use crate::error::{Error, NotFoundLogDirSnafu, Result};
use chrono::Local;
use once_cell::sync::OnceCell;
use snafu::ResultExt as _;
use std::fs::{self, DirEntry, File};
use std::path::Path;
use std::str::FromStr as _;
use std::time::SystemTime;
use tauri::Manager as _;
use tracing_subscriber::{
    filter::LevelFilter,
    fmt,
    prelude::*,
    reload::{self, Handle},
    Registry,
};

/// Global variable to allow dynamic level changes in logger.
pub static RELOAD_HANDLE: OnceCell<Handle<LevelFilter, Registry>> = OnceCell::new();

/// Initializes logger.
///
/// # Errors
/// Double init
pub(crate) fn init(app: &tauri::App) -> Result<()> {
    let resolver = app.path();
    let log_dir = &resolver.app_log_dir().context(NotFoundLogDirSnafu)?;
    let log_name = format!("{}.log", app.package_info().name);

    // Unable `pretty()` & `with_ansi(false)` combination in `#[tracing::instrument]`
    // ref: https://github.com/tokio-rs/tracing/issues/1310
    let fmt_layer = fmt::layer()
        .compact()
        .with_ansi(false)
        .with_file(true)
        .with_line_number(true)
        .with_target(false)
        .with_writer(create_rotate_log(log_dir, &log_name, 4)?);

    let (filter, reload_handle) = reload::Layer::new(LevelFilter::ERROR);
    tracing_subscriber::registry()
        .with(filter)
        .with(fmt_layer)
        .init();

    RELOAD_HANDLE
        .set(reload_handle)
        .map_err(|_e| Error::FailedInitLog)
}

/// If unknown log level, fallback to `error`.
///
/// # Errors
/// If logger uninitialized.
pub(crate) fn change_level(log_level: &str) -> Result<()> {
    let new_filter = LevelFilter::from_str(log_level).unwrap_or_else(|_e| {
        tracing::warn!("Unknown log level: {log_level}. Fallback to `error`");
        LevelFilter::ERROR
    });
    match RELOAD_HANDLE.get() {
        Some(log) => Ok(log.modify(|filter| *filter = new_filter)?),
        None => Err(Error::UninitializedLogger),
    }
}

/// Rotation Logger File Creator.
/// - When the maximum count is reached, delete the descending ones first and create a new log file.
///
/// # Why did you make this?
/// Because `tracing_appender` must be executed in the **root function** to work.
/// In this case where the log location is obtained with tauri, the logger cannot be initialized with the root function.
fn create_rotate_log(
    log_dir: impl AsRef<Path>,
    log_name: &str,
    max_log_count: usize,
) -> Result<File> {
    fs::create_dir_all(&log_dir)?;

    let mut log_files = fs::read_dir(&log_dir)?
        .filter_map(|entry| entry.ok())
        .filter(|entry| {
            entry
                .file_name()
                .to_str()
                .is_some_and(|name| name.starts_with(log_name))
        })
        .collect::<Vec<_>>();

    let log_file = log_dir.as_ref().join(log_name);
    if log_files.len() >= max_log_count {
        // modify sort
        log_files.sort_by(|a, b| {
            fn get_modify_time(dir: &DirEntry) -> Result<SystemTime, bool> {
                dir.metadata()
                    .as_ref()
                    .map_or(Err(false), |meta| meta.modified().map_err(|_| false))
            }
            get_modify_time(a).cmp(&get_modify_time(b))
        });
        if let Some(oldest_file) = log_files.first() {
            fs::remove_file(oldest_file.path())?;
        }
    };

    let old_file = log_dir.as_ref().join(format!(
        "{log_name}_{}.log",
        Local::now().format("%F_%H-%M-%S")
    ));
    if log_file.exists() {
        fs::rename(&log_file, old_file)?;
    };

    Ok(File::create(log_file)?)
}

#[cfg(test)]
mod tests {
    use super::*;
    use pretty_assertions::assert_eq;

    #[test]
    fn should_rotate_log() -> Result<()> {
        let log_dir = temp_dir::TempDir::new()?;
        let log_dir = log_dir.path();
        for _ in 0..5 {
            create_rotate_log(log_dir, "log.log", 3)?;
            std::thread::sleep(std::time::Duration::from_secs(1));
        }

        fn get_files_in_dir(dir_path: impl AsRef<Path>) -> Result<Vec<DirEntry>> {
            let dir = fs::read_dir(dir_path)?;
            let files = dir
                .filter_map(|entry| entry.ok())
                .filter(|entry| entry.file_type().map(|ft| !ft.is_dir()).unwrap_or(false))
                .collect::<Vec<DirEntry>>();
            Ok(files)
        }

        let files = get_files_in_dir(log_dir)?;
        assert_eq!(files.len(), 3);
        Ok(())
    }
}
