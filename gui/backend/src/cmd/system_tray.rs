use crate::setup::TRAY_ICON;
use tauri::image::Image;

#[derive(Debug, Clone, Copy, Default, serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "snake_case")]
pub enum IconType {
    /// Battery information is displayed in a circle
    #[default]
    Circle,
    /// Battery information is displayed numerically
    NumberBox,
}

/// Update application tray icon & name
///
/// # Panics
/// 0 <= battery_level <= 100
#[tracing::instrument(level = "trace")]
pub fn update_tray_inner(
    device_name: &str,
    battery_level: u64,
    is_connected: bool,
    icon_type: IconType,
) -> tauri::Result<()> {
    let battery_icon = if is_connected {
        match battery_level {
            0 => include_bytes!("../../icons/battery/battery-0.png"),
            1..=10 => include_bytes!("../../icons/battery/battery-10.png").as_slice(),
            11..=20 => include_bytes!("../../icons/battery/battery-20.png").as_slice(),
            21..=30 => include_bytes!("../../icons/battery/battery-30.png").as_slice(),
            31..=40 => include_bytes!("../../icons/battery/battery-40.png").as_slice(),
            41..=50 => include_bytes!("../../icons/battery/battery-50.png").as_slice(),
            51..=60 => include_bytes!("../../icons/battery/battery-60.png").as_slice(),
            61..=70 => include_bytes!("../../icons/battery/battery-70.png").as_slice(),
            71..=80 => include_bytes!("../../icons/battery/battery-80.png").as_slice(),
            81..=90 => include_bytes!("../../icons/battery/battery-90.png").as_slice(),
            91..=100 => include_bytes!("../../icons/battery/battery-100.png").as_slice(),
            _ => unreachable!(),
        }
    } else {
        match battery_level {
            0 => include_bytes!("../../icons/battery_power_off/battery-0.png"),
            1..=10 => include_bytes!("../../icons/battery_power_off/battery-10.png").as_slice(),
            11..=20 => include_bytes!("../../icons/battery_power_off/battery-20.png").as_slice(),
            21..=30 => include_bytes!("../../icons/battery_power_off/battery-30.png").as_slice(),
            31..=40 => include_bytes!("../../icons/battery_power_off/battery-40.png").as_slice(),
            41..=50 => include_bytes!("../../icons/battery_power_off/battery-50.png").as_slice(),
            51..=60 => include_bytes!("../../icons/battery_power_off/battery-60.png").as_slice(),
            61..=70 => include_bytes!("../../icons/battery_power_off/battery-70.png").as_slice(),
            71..=80 => include_bytes!("../../icons/battery_power_off/battery-80.png").as_slice(),
            81..=90 => include_bytes!("../../icons/battery_power_off/battery-90.png").as_slice(),
            91..=100 => include_bytes!("../../icons/battery_power_off/battery-100.png").as_slice(),
            _ => unreachable!(),
        }
    };

    if let Ok(mut guard) = TRAY_ICON.lock() {
        if let Some(tray) = guard.as_mut() {
            match icon_type {
                IconType::Circle => {
                    tray.set_icon(Some(Image::from_bytes(battery_icon)?))?;
                }
                IconType::NumberBox => {
                    tray.set_icon(Some(crate::cmd::supports::icon::create_battery_image(
                        64,
                        64,
                        battery_level,
                        is_connected,
                    )))?;
                }
            }

            let tooltip = format!("{device_name} {battery_level}%");
            tray.set_tooltip(Some(tooltip))?;
        };
    };

    Ok(())
}

/// Update application tray icon & name
pub async fn default_tray_inner() -> tauri::Result<()> {
    const LOADING_MSG: &str = "Getting bluetooth battery...";
    const DEFAULT_ICON: &[u8] = include_bytes!("../../icons/icon.png").as_slice();

    if let Ok(mut guard) = TRAY_ICON.lock() {
        if let Some(tray) = guard.as_mut() {
            tray.set_icon(Some(Image::from_bytes(DEFAULT_ICON)?))?;
            tray.set_tooltip(Some(LOADING_MSG))?;
        };
    };
    Ok(())
}

#[tauri::command]
pub async fn update_tray(
    device_name: &str,
    battery_level: u64,
    is_connected: bool,
    icon_type: IconType,
) -> tauri::Result<()> {
    update_tray_inner(device_name, battery_level, is_connected, icon_type)
}

#[tauri::command]
pub async fn default_tray() -> tauri::Result<()> {
    default_tray_inner().await
}
