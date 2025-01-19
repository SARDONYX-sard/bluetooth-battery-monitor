use super::sub_category::{MajorCategory, SubCategory4, SubCategory5};

#[derive(Debug, snafu::Snafu)]
#[snafu(visibility(pub))]
pub enum CategoryError {
    /// Failed to cast major category as u32: {major}
    FailedToCastMajor { major: MajorCategory },
    /// Failed to cast sub category4 as u32: {sub}
    FailedToCastCategory4 { sub: SubCategory4 },
    /// Failed to cast sub category5 as u32: {sub}
    FailedToCastCategory5 { sub: SubCategory5 },
}
