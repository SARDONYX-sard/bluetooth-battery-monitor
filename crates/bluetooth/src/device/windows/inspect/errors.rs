#[derive(Debug, snafu::Snafu)]
pub enum RevealError {
    /// Failed to cast key '{key}' to the expected type '{expected_type}'
    TypeCastError { key: String, expected_type: String },
    /// Unknown type for key '{key}': {unknown_type}
    UnknownTypeError { key: String, unknown_type: String },

    #[snafu(transparent)]
    #[cfg(target_os = "windows")]
    Error { source: windows::core::Error },
}
