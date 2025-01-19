use super::{
    errors::CategoryError,
    sub_category::{MajorCategory, SubCategory, SubCategory4, SubCategory5},
};
use num_traits::{FromPrimitive as _, ToPrimitive as _};
use parse_display::{Display, FromStr};

/// `Category`
#[cfg_attr(
    feature = "serde",
    derive(serde_with::SerializeDisplay, serde_with::DeserializeFromStr)
)]
#[derive(Debug, Clone, Default, PartialEq, Eq, PartialOrd, Ord, Hash, Display, FromStr)]
#[display("{major}: {sub}")]
pub struct Category {
    /// major category
    pub major: MajorCategory,
    /// sub category
    pub sub: SubCategory,
}

// This code is inspired from C++.
// See: https://github.com/joric/bluetooth-battery-monitor/blob/master/misc/bt_classic_test.cpp#L6
impl TryFrom<u32> for Category {
    type Error = CategoryError;

    fn try_from(cod: u32) -> Result<Self, Self::Error> {
        let major = (cod >> 8) & 0b00011111;
        let minor = (cod >> 2) & 0b00111111;

        let sub = match major {
            4 => SubCategory::Category4(SubCategory4::from_u32(minor).unwrap_or_default()),
            5 => SubCategory::Category5(SubCategory5::from_u32(minor >> 4).unwrap_or_default()),
            _ => SubCategory::None,
        };
        let major = MajorCategory::from_u32(major).unwrap_or_default();

        Ok(Self { major, sub })
    }
}

impl TryFrom<Category> for u32 {
    type Error = CategoryError;

    fn try_from(value: Category) -> Result<Self, Self::Error> {
        let Category { major, sub } = value;

        let major =
            MajorCategory::to_u32(&major).ok_or(CategoryError::FailedToCastMajor { major })?;

        let minor: u32 = match sub {
            SubCategory::Category4(sub) => {
                let minor = SubCategory4::to_u32(&sub)
                    .ok_or(CategoryError::FailedToCastCategory4 { sub })?;
                (minor & 0b00111111) << 2
            }
            SubCategory::Category5(sub) => {
                let minor = SubCategory5::to_u32(&sub)
                    .ok_or(CategoryError::FailedToCastCategory5 { sub })?;
                (minor & 0b00001111) << 4
            }
            SubCategory::None => 0,
        };

        Ok((major << 8) | minor)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use pretty_assertions::assert_eq;

    #[test]
    fn test_bluetooth_class_try_from_category() {
        let category = Category {
            major: MajorCategory::AudioVideo,
            sub: SubCategory::Category4(SubCategory4::HandsFreeDevice),
        };

        let expected_cod = (MajorCategory::to_u32(&MajorCategory::AudioVideo).unwrap() << 8)
            | ((SubCategory4::to_u32(&SubCategory4::HandsFreeDevice).unwrap() & 0b00111111) << 2);

        match u32::try_from(category) {
            Ok(bt_class) => assert_eq!(bt_class, expected_cod),
            Err(err) => panic!("Failed with error: {:?}", err),
        }
    }

    #[test]
    fn test_category_try_from_bluetooth_class() {
        let expected_category = Category {
            major: MajorCategory::AudioVideo,
            sub: SubCategory::Category4(SubCategory4::WearableHeadsetDevice),
        };

        let bt_class = 2360324;
        match Category::try_from(bt_class) {
            Ok(category) => assert_eq!(category, expected_category),
            Err(err) => panic!("Failed with error: {:?}", err),
        };

        let expected_category = Category {
            major: MajorCategory::AudioVideo,
            sub: SubCategory::Category4(SubCategory4::Headphones),
        };
        assert_eq!(Category::try_from(2360344).unwrap(), expected_category);
    }
}
