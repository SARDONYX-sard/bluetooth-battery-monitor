use std::fmt::Display;

use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, Serialize, Deserialize)]
/// Bluetooth device information Json
pub struct BluetoothDeviceInfo {
    pub class_of_device: String,
    pub bluetooth_address: String,
    pub is_connected: bool,
    pub is_remembered: bool,
    pub is_authenticated: bool,
    pub last_seen: SystemTime,
    pub last_used: SystemTime,
    pub device_name: String,
}

#[derive(Debug, Clone)]
pub struct BluetoothClass(u32);

impl From<u32> for BluetoothClass {
    fn from(value: u32) -> Self {
        Self(value)
    }
}

impl From<BluetoothClass> for u32 {
    fn from(bt_class: BluetoothClass) -> u32 {
        bt_class.0
    }
}

/// Bluetooth major category
const CC: [&str; 10] = [
    "Miscellaneous",
    "Computer",
    "Phone",
    "LAN/Network Access Point",
    "Audio/Video",
    "Peripheral",
    "Imaging",
    "Wearable",
    "Toy",
    "Health",
];

/// Bluetooth sub category 4
const CC4: [&str; 19] = [
    "Uncategorized",
    "Wearable Headset Device",
    "Hands-free Device",
    "(Reserved)",
    "Microphone",
    "Loudspeaker",
    "Headphones",
    "Portable Audio",
    "Car audio",
    "Set-top box",
    "HiFi Audio Device",
    "VCR",
    "Video Camera",
    "Camcorder",
    "Video Monitor",
    "Video Display and Loudspeaker",
    "Video Conferencing",
    "(Reserved)",
    "Gaming/Toy",
];

/// Bluetooth sub category 5
const CC5: [&str; 4] = ["Unknown", "Keyboard", "Mouse", "Keyboard/Mouse Combo"];

impl TryFrom<&str> for BluetoothClass {
    type Error = &'static str;

    fn try_from(input: &str) -> Result<Self, Self::Error> {
        for (major, category) in CC.iter().enumerate() {
            if input.starts_with(category) {
                let sub = input
                    .strip_prefix(category)
                    .map(|s| s.trim().replace(": ", ""));

                let minor = match major {
                    4 => CC4
                        .iter()
                        .position(|x| {
                            trace!("Try from sub: {sub:?}, x:{x}");
                            sub == Some(x.to_string())
                        })
                        .unwrap(),
                    5 => {
                        let sub_major =
                            CC5.iter().position(|x| sub == Some(x.to_string())).unwrap();
                        sub_major << 4
                    }
                    _ => return Err("Unknown"),
                };
                let cod = ((major & 0x1f) << 8) | ((minor & 0x3f) << 2);
                return Ok(BluetoothClass::from(cod as u32));
            }
        }

        Err("Unknown")
    }
}

impl Display for BluetoothClass {
    /// This code is converted from C++.
    /// See: https://github.com/joric/bluetooth-battery-monitor/blob/master/misc/bt_classic_test.cpp#L6
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        let cod = self.0 as usize;
        let major = (cod >> 8) & 0x1f;
        let minor = (cod >> 2) & 0x3f;
        let cc_count = CC.len();
        let cat = if major < cc_count {
            CC[major]
        } else {
            "Unknown"
        };
        let sub = match major {
            4 => Some(CC4[minor]),
            5 => Some(CC5[minor >> 4]),
            _ => None,
        };
        if let Some(sub_class) = sub {
            write!(f, "{}: {}", cat, sub_class)
        } else {
            write!(f, "{}", cat)
        }
    }
}

/// Network byte order(Big endian) u64
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct BluetoothAddress(u64);

pub enum ByteOrder {
    BigEndian,
    LittleEndian,
}

impl BluetoothAddress {
    /// Convert from big endian address to hex string representation.
    ///
    /// e.g.    BigEndian: [0xcc, 0xbb, 0xaa, 0x22, 0x11, 0x00] => "001122aabbcc"
    /// e.g. LittleEndian: [0xcc, 0xbb, 0xaa, 0x22, 0x11, 0x00] => "ccbbaa221100"
    pub fn as_hex_string(&self) -> String {
        self.as_hex_string_with_colon(ByteOrder::BigEndian)
            .replace(':', "")
    }

    /// Convert from big endian address to hex string with colon representation.
    ///
    /// e.g. [0xcc, 0xbb, 0xaa, 0x22, 0x11, 0x00] => "00:11:22:aa:bb:cc"
    pub fn as_hex_string_with_colon(&self, byte_order: ByteOrder) -> String {
        let rg_bytes: [u8; 6] = (*self).clone().into();
        match byte_order {
            ByteOrder::BigEndian => format!(
                "{:02x}:{:02x}:{:02x}:{:02x}:{:02x}:{:02x}",
                rg_bytes[0], rg_bytes[1], rg_bytes[2], rg_bytes[3], rg_bytes[4], rg_bytes[5],
            ),
            ByteOrder::LittleEndian => format!(
                "{:02x}:{:02x}:{:02x}:{:02x}:{:02x}:{:02x}",
                rg_bytes[5], rg_bytes[4], rg_bytes[3], rg_bytes[2], rg_bytes[1], rg_bytes[0],
            ),
        }
    }
}

impl Display for BluetoothAddress {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(
            f,
            "{}",
            self.as_hex_string_with_colon(ByteOrder::LittleEndian)
        )
    }
}

impl From<u64> for BluetoothAddress {
    fn from(value: u64) -> Self {
        BluetoothAddress(value)
    }
}

impl From<BluetoothAddress> for u64 {
    fn from(bt_addr: BluetoothAddress) -> Self {
        bt_addr.0
    }
}

impl From<[u8; 6]> for BluetoothAddress {
    fn from(slice: [u8; 6]) -> Self {
        let mut result: u64 = 0;
        for (i, byte) in slice.iter().enumerate() {
            result |= (u64::from(*byte)) << ((5 - i) * 8);
        }
        Self(result)
    }
}

impl From<BluetoothAddress> for [u8; 6] {
    fn from(address: BluetoothAddress) -> Self {
        let mut result = [0u8; 6];
        for i in 0..6 {
            result[5 - i] = ((address.0 >> (i * 8)) & 0xFF) as u8;
        }
        result
    }
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct SystemTime {
    pub year: u16,
    pub month: u16,
    pub day_of_week: u16,
    pub day: u16,
    pub hour: u16,
    pub minute: u16,
    pub second: u16,
    pub milliseconds: u16,
}

#[cfg(test)]
mod tests {
    use super::BluetoothClass;

    #[test]
    fn should_parse_class_num_to_name() {
        let bt_class_num = 2360324;
        let class_name = BluetoothClass::from(bt_class_num).to_string();
        assert_eq!(class_name, "Audio/Video: Wearable Headset Device");
    }

    #[test]
    fn should_parse_class_name_to_num_to_name() {
        let bt_class_str = "Audio/Video: Wearable Headset Device";

        let bt_class = BluetoothClass::try_from(bt_class_str).unwrap();
        dbg!(bt_class.0);
        let class_name = BluetoothClass::from(bt_class.0).to_string();
        assert_eq!(class_name, bt_class_str);
    }
}
