use anyhow::{Context as _, Result};
use chrono::Local;
use once_cell::sync::OnceCell;
use std::fs::{self, File};
use std::path::Path;
use tracing_subscriber::{
    filter::{self, LevelFilter},
    fmt,
    prelude::*,
    reload::{self, Handle},
    Registry,
};

pub static LOG_INSTANCE: OnceCell<Handle<LevelFilter, Registry>> = OnceCell::new();

/// Initializes logger.
///
/// # Errors
/// Double init
pub(super) fn init_logger(app: &tauri::App) -> Result<()> {
    let resolver = app.path_resolver();
    let log_dir = &resolver.app_log_dir().context("Not found log dir")?;
    let log_name = format!("{}.log", app.package_info().name);

    // Not available yet because ansi(false) is not applied in tracing::instrument under the combination of pretty() and with_ansi(false).
    // - See https://github.com/tokio-rs/tracing/issues/1310
    let fmt_layer = fmt::layer()
        .compact()
        .with_ansi(false)
        .with_file(true)
        .with_line_number(true)
        .with_target(false)
        .with_writer(create_rotate_log(log_dir, &log_name, 4)?);

    let (filter, reload_handle) = reload::Layer::new(filter::LevelFilter::ERROR);
    tracing_subscriber::registry()
        .with(filter)
        .with(fmt_layer)
        .init();
    tracing::debug!("logger file path: {log_name:?}");
    if LOG_INSTANCE.set(reload_handle).is_err() {
        Err(anyhow::anyhow!("Couldn't init logger"))?
    };
    Ok(())
}

/// Rotation Logger File Creator.
/// - When the maximum count is reached, delete the descending ones first and create a new log file.
///
/// # Why did you make this?
/// Because `tracing_appender` must be executed in the **root function** to work.
/// In this case where the log location is obtained with tauri, the logger cannot be initialized with the root function.
fn create_rotate_log(log_dir: impl AsRef<Path>, log_name: &str, max_files: usize) -> Result<File> {
    fs::create_dir_all(&log_dir)?;

    let mut log_files = fs::read_dir(&log_dir)?
        .filter_map(|entry| entry.ok())
        .filter(|entry| {
            entry
                .file_name()
                .to_str()
                .map(|name| name.starts_with(log_name))
                .unwrap_or(false)
        })
        .collect::<Vec<_>>();

    let mut log_count = log_files.len();
    tracing::debug!("-- Start log count: {log_count} --");
    let log_file = log_dir.as_ref().join(log_name);
    if log_files.len() >= max_files {
        log_files.sort_by(|a, b| {
            // NOTE: Error in OS that can't be modified, but not considered here.
            a.metadata()
                .unwrap()
                .modified()
                .unwrap()
                .cmp(&b.metadata().unwrap().modified().unwrap())
        });
        if let Some(oldest_file) = log_files.first() {
            tracing::info!("Remove old log {oldest_file:?}");
            log_count -= 1;
            fs::remove_file(oldest_file.path())?;
        }
    };

    let old_file = log_dir.as_ref().join(format!(
        "{log_name}_{}.log",
        Local::now().format("%F_%H-%M-%S")
    ));

    if log_file.exists() {
        tracing::info!(
            "Rename: {:?} => {:?}",
            &log_file.file_name(),
            &old_file.file_name()
        );
        fs::rename(&log_file, old_file)?;
    };

    let f = File::create(log_file)?;
    tracing::debug!("-- End log count: {} --", log_count + 1);
    Ok(f)
}

#[cfg(test)]
mod tests {
    use super::*;
    use pretty_assertions::assert_eq;

    /// tracing initializer
    macro_rules! logger_init {
        ($level:ident) => {
            let (non_blocking, _guard) = tracing_appender::non_blocking(std::io::stdout());
            tracing_subscriber::fmt()
                .with_writer(non_blocking)
                .with_ansi(false)
                .with_max_level(tracing::Level::$level)
                .init();
        };
    }

    #[test]
    fn should_rotate_log() -> Result<()> {
        logger_init!(ERROR);

        let log_dir = temp_dir::TempDir::new()?;
        let log_dir = log_dir.path();
        for _ in 0..5 {
            create_rotate_log(log_dir, "app.log", 3)?;
            std::thread::sleep(std::time::Duration::from_secs(1));
        }

        fn get_files_in_dir(dir_path: impl AsRef<Path>) -> Result<Vec<fs::DirEntry>> {
            let dir = fs::read_dir(dir_path)?;
            let files = dir
                .filter_map(|entry| entry.ok())
                .filter(|entry| entry.file_type().map(|ft| ft.is_file()).unwrap_or(false))
                .collect::<Vec<fs::DirEntry>>();
            Ok(files)
        }

        let files = get_files_in_dir(log_dir)?;
        tracing::debug!("{:?}", &files);
        assert_eq!(files.len(), 3);
        Ok(())
    }
}
