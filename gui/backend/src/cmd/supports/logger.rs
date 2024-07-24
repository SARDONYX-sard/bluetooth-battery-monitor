use std::str::FromStr as _;
use tracing_subscriber::filter;

pub(crate) fn change_log_level(log_level: &str) -> anyhow::Result<()> {
    let log_level = match log_level {
        "trace" | "debug" | "info" | "warn" | "error" => log_level,
        unknown_level => {
            tracing::warn!("Unknown log level {unknown_level}. Fallback to error");
            "error"
        }
    };
    match crate::LOG_INSTANCE.get() {
        Some(log) => Ok(log.modify(|filter| {
            *filter = filter::LevelFilter::from_str(log_level).unwrap_or(filter::LevelFilter::ERROR)
        })?),
        None => anyhow::bail!("Uninitialized logger."),
    }
}
