//! errors of `This crate`
use std::{io, path::PathBuf};

/// GUI Error
#[derive(Debug, snafu::Snafu)]
#[snafu(visibility(pub))]
pub enum Error {
    /// Failed to read file from
    #[snafu(display("{source}: {}", path.display()))]
    FailedReadFile { source: io::Error, path: PathBuf },

    /// Standard io error
    #[snafu(transparent)]
    FailedIo { source: io::Error },

    /// Not found resource dir
    NotFoundResourceDir { source: tauri::Error },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Logger
    /// Not found log dir
    NotFoundLogDir { source: tauri::Error },

    /// Failed to initialize logger.
    FailedInitLog,

    /// Uninitialized logger.
    UninitLog,

    /// Tracing log error
    #[snafu(transparent)]
    FailedSetTracing {
        source: tracing::subscriber::SetGlobalDefaultError,
    },

    /// Tracing subscriber reload error
    #[snafu(transparent)]
    FailedReloadTracingSub {
        source: tracing_subscriber::reload::Error,
    },
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
}

/// `Result` for this crate.
pub type Result<T, E = Error> = core::result::Result<T, E>;
