use num_derive::{FromPrimitive, ToPrimitive};
use parse_display::{Display, FromStr};

/// `MajorCategory`
#[cfg_attr(
    feature = "serde",
    derive(serde_with::SerializeDisplay, serde_with::DeserializeFromStr)
)]
#[derive(
    Debug,
    Clone,
    Default,
    PartialEq,
    Eq,
    PartialOrd,
    Ord,
    Hash,
    Display,
    FromStr,
    ToPrimitive,
    FromPrimitive,
)]
pub enum MajorCategory {
    Miscellaneous,
    Computer,
    Phone,
    #[display("LAN/Network Access Point")]
    LanNetworkAccessPoint,
    #[display("Audio/Video")]
    AudioVideo,
    Peripheral,
    Imaging,
    Wearable,
    Toy,
    Health,

    /// This item does not exist in the category.
    #[default]
    Unknown,
}

// ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/// SubCategory 4 or 5
#[cfg_attr(
    feature = "serde",
    derive(serde_with::SerializeDisplay, serde_with::DeserializeFromStr)
)]
#[derive(Debug, Default, Clone, PartialEq, Eq, PartialOrd, Ord, Hash, Display, FromStr)]
pub enum SubCategory {
    #[display("{0}")]
    Category4(SubCategory4),
    #[display("{0}")]
    Category5(SubCategory5),
    #[default]
    None,
}

/// It is used when MajorCategory is 4.
#[cfg_attr(
    feature = "serde",
    derive(serde_with::SerializeDisplay, serde_with::DeserializeFromStr)
)]
#[derive(
    Debug,
    Clone,
    Default,
    PartialEq,
    Eq,
    PartialOrd,
    Ord,
    Hash,
    Display,
    FromStr,
    ToPrimitive,
    FromPrimitive,
)]
pub enum SubCategory4 {
    #[display("Uncategorized")]
    #[default]
    Uncategorized = 0,

    #[display("Wearable Headset Device")]
    WearableHeadsetDevice = 1,

    #[display("Hands-free Device")]
    HandsFreeDevice = 2,

    #[display("Microphone")]
    Microphone = 4,

    #[display("Loudspeaker")]
    Loudspeaker = 5,

    #[display("Headphones")]
    Headphones = 6,

    #[display("Portable Audio")]
    PortableAudio = 7,

    #[display("Car audio")]
    CarAudio,

    #[display("Set-top box")]
    SetTopBox,

    #[display("HiFi Audio Device")]
    HiFiAudioDevice,

    #[display("VCR")]
    Vcr,

    #[display("Video Camera")]
    VideoCamera,

    #[display("Camcorder")]
    Camcorder,

    #[display("Video Monitor")]
    VideoMonitor,

    #[display("Video Display and Loudspeaker")]
    VideoDisplayAndLoudspeaker,

    #[display("Video Conferencing")]
    VideoConferencing,

    #[display("Gaming/Toy")]
    GamingToy = 18,
}

/// It is used when MajorCategory is 5.
#[cfg_attr(
    feature = "serde",
    derive(serde_with::SerializeDisplay, serde_with::DeserializeFromStr)
)]
#[derive(
    Debug,
    Clone,
    Default,
    PartialEq,
    Eq,
    PartialOrd,
    Ord,
    Hash,
    Display,
    FromStr,
    ToPrimitive,
    FromPrimitive,
)]
pub enum SubCategory5 {
    #[default]
    Unknown,
    Keyboard,
    Mouse,
    #[display("Keyboard/Mouse Combo")]
    KeyboardMouseCombo,
}
