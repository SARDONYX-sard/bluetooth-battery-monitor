mod errors;
mod impls;

use windows::core::{IInspectable, HSTRING};
use windows::Foundation::Collections::IKeyValuePair;

pub use errors::RevealError;
pub use impls::RevealValue;

/// print property key and value.
///
/// # Errors
/// If failed to type cast
pub fn reveal_value<T>(prop: IKeyValuePair<HSTRING, IInspectable>) -> Result<T, RevealError>
where
    T: RevealValue,
{
    let key = prop.Key()?;
    let value = prop.Value()?;

    let runtime_class_name = value.GetRuntimeClassName()?.to_string();
    match runtime_class_name.as_str() {
        "Windows.Foundation.IReference`1<Boolean>" => T::reveal(&value).map_or_else(
            |_| {
                Err(RevealError::TypeCastError {
                    key: key.to_string(),
                    expected_type: "Boolean".to_string(),
                })
            },
            Ok,
        ),
        "Windows.Foundation.IReference`1<String>" => T::reveal(&value).map_or_else(
            |_| {
                Err(RevealError::TypeCastError {
                    key: key.to_string(),
                    expected_type: "String".to_string(),
                })
            },
            Ok,
        ),
        "Windows.Foundation.IReference`1<UInt8>" => T::reveal(&value).map_or_else(
            |_| {
                Err(RevealError::TypeCastError {
                    key: key.to_string(),
                    expected_type: "UInt8".to_string(),
                })
            },
            Ok,
        ),
        "Windows.Foundation.IReference`1<Windows.Foundation.DateTime>" => T::reveal(&value)
            .map_or_else(
                |_| {
                    Err(RevealError::TypeCastError {
                        key: key.to_string(),
                        expected_type: "DateTime".to_string(),
                    })
                },
                Ok,
            ),
        unknown => Err(RevealError::UnknownTypeError {
            key: key.to_string(),
            unknown_type: unknown.to_string(),
        }),
    }
}
