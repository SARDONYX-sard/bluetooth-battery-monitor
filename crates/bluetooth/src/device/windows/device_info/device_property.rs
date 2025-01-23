use core::fmt;

#[allow(clippy::enum_variant_names)]
#[derive(Debug, Copy, Clone, PartialEq, Eq)]
pub enum DevPropType {
    Empty = 0,
    Null = 1,
    SByte = 2,
    Byte = 3,
    Int16 = 4,
    UInt16 = 5,
    Int32 = 6,
    UInt32 = 7,
    Int64 = 8,
    UInt64 = 9,
    Float = 10,
    Double = 11,
    Decimal = 12,
    Guid = 13,
    Currency = 14,
    Date = 15,
    FileTime = 16,
    Boolean = 17,
    String = 18,
    SecurityDescriptor = 19,
    SecurityDescriptorString = 20,
    DevPropKey = 21,
    DevPropType = 22,
    Error = 23,
    NtStatus = 24,
    StringIndirect = 25,
    StringList = 8210,
    Array = 4096,
    List = 8192,
    Binary = 4099,
}

impl DevPropType {
    pub const fn from_u32(value: u32) -> Option<Self> {
        match value {
            0 => Some(Self::Empty),
            1 => Some(Self::Null),
            2 => Some(Self::SByte),
            3 => Some(Self::Byte),
            4 => Some(Self::Int16),
            5 => Some(Self::UInt16),
            6 => Some(Self::Int32),
            7 => Some(Self::UInt32),
            8 => Some(Self::Int64),
            9 => Some(Self::UInt64),
            10 => Some(Self::Float),
            11 => Some(Self::Double),
            12 => Some(Self::Decimal),
            13 => Some(Self::Guid),
            14 => Some(Self::Currency),
            15 => Some(Self::Date),
            16 => Some(Self::FileTime),
            17 => Some(Self::Boolean),
            18 => Some(Self::String),
            19 => Some(Self::SecurityDescriptor),
            20 => Some(Self::SecurityDescriptorString),
            21 => Some(Self::DevPropKey),
            22 => Some(Self::DevPropType),
            23 => Some(Self::Error),
            24 => Some(Self::NtStatus),
            25 => Some(Self::StringIndirect),
            8210 => Some(Self::StringList),
            4096 => Some(Self::Array),
            8192 => Some(Self::List),
            4099 => Some(Self::Binary),
            _ => None,
        }
    }

    pub const fn as_str(&self) -> &'static str {
        match self {
            Self::Empty => "Empty",
            Self::Null => "Null",
            Self::SByte => "SByte",
            Self::Byte => "Byte",
            Self::Int16 => "Int16",
            Self::UInt16 => "UInt16",
            Self::Int32 => "Int32",
            Self::UInt32 => "UInt32",
            Self::Int64 => "Int64",
            Self::UInt64 => "UInt64",
            Self::Float => "Float",
            Self::Double => "Double",
            Self::Decimal => "Decimal",
            Self::Guid => "Guid",
            Self::Currency => "Currency",
            Self::Date => "Date",
            Self::FileTime => "FileTime",
            Self::Boolean => "Boolean",
            Self::String => "String",
            Self::SecurityDescriptor => "SecurityDescriptor",
            Self::SecurityDescriptorString => "SecurityDescriptorString",
            Self::DevPropKey => "DevPropKey",
            Self::DevPropType => "DevPropType",
            Self::Error => "Error",
            Self::NtStatus => "NtStatus",
            Self::StringIndirect => "StringIndirect",
            Self::StringList => "StringList",
            Self::Array => "Array",
            Self::List => "List",
            Self::Binary => "Binary",
        }
    }
}

impl fmt::Display for DevPropType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}", self.as_str())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_dev_prop_type() {
        assert_eq!(DevPropType::from_u32(0), Some(DevPropType::Empty));
        assert_eq!(DevPropType::from_u32(4096), Some(DevPropType::Array));
        assert_eq!(DevPropType::from_u32(10000), None);
    }
}
