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
    pub fn from_u32(value: u32) -> Option<Self> {
        match value {
            0 => Some(DevPropType::Empty),
            1 => Some(DevPropType::Null),
            2 => Some(DevPropType::SByte),
            3 => Some(DevPropType::Byte),
            4 => Some(DevPropType::Int16),
            5 => Some(DevPropType::UInt16),
            6 => Some(DevPropType::Int32),
            7 => Some(DevPropType::UInt32),
            8 => Some(DevPropType::Int64),
            9 => Some(DevPropType::UInt64),
            10 => Some(DevPropType::Float),
            11 => Some(DevPropType::Double),
            12 => Some(DevPropType::Decimal),
            13 => Some(DevPropType::Guid),
            14 => Some(DevPropType::Currency),
            15 => Some(DevPropType::Date),
            16 => Some(DevPropType::FileTime),
            17 => Some(DevPropType::Boolean),
            18 => Some(DevPropType::String),
            19 => Some(DevPropType::SecurityDescriptor),
            20 => Some(DevPropType::SecurityDescriptorString),
            21 => Some(DevPropType::DevPropKey),
            22 => Some(DevPropType::DevPropType),
            23 => Some(DevPropType::Error),
            24 => Some(DevPropType::NtStatus),
            25 => Some(DevPropType::StringIndirect),
            8210 => Some(DevPropType::StringList),
            4096 => Some(DevPropType::Array),
            8192 => Some(DevPropType::List),
            4099 => Some(DevPropType::Binary),
            _ => None,
        }
    }

    pub fn as_str(&self) -> &'static str {
        match self {
            DevPropType::Empty => "Empty",
            DevPropType::Null => "Null",
            DevPropType::SByte => "SByte",
            DevPropType::Byte => "Byte",
            DevPropType::Int16 => "Int16",
            DevPropType::UInt16 => "UInt16",
            DevPropType::Int32 => "Int32",
            DevPropType::UInt32 => "UInt32",
            DevPropType::Int64 => "Int64",
            DevPropType::UInt64 => "UInt64",
            DevPropType::Float => "Float",
            DevPropType::Double => "Double",
            DevPropType::Decimal => "Decimal",
            DevPropType::Guid => "Guid",
            DevPropType::Currency => "Currency",
            DevPropType::Date => "Date",
            DevPropType::FileTime => "FileTime",
            DevPropType::Boolean => "Boolean",
            DevPropType::String => "String",
            DevPropType::SecurityDescriptor => "SecurityDescriptor",
            DevPropType::SecurityDescriptorString => "SecurityDescriptorString",
            DevPropType::DevPropKey => "DevPropKey",
            DevPropType::DevPropType => "DevPropType",
            DevPropType::Error => "Error",
            DevPropType::NtStatus => "NtStatus",
            DevPropType::StringIndirect => "StringIndirect",
            DevPropType::StringList => "StringList",
            DevPropType::Array => "Array",
            DevPropType::List => "List",
            DevPropType::Binary => "Binary",
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
