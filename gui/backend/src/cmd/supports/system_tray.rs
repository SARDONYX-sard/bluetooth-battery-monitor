/// Update application tray icon & name
pub async fn update_tray(
    app: &tauri::AppHandle,
    device_name: &str,
    battery_level: u64,
) -> tauri::Result<()> {
    tracing::debug!("Change to {battery_level} battery icon",);

    let battery_icon = match battery_level {
        0 => include_bytes!("../../../icons/battery/battery-0.png"),
        1..=10 => include_bytes!("../../../icons/battery/battery-10.png").as_slice(),
        11..=20 => include_bytes!("../../../icons/battery/battery-20.png").as_slice(),
        21..=30 => include_bytes!("../../../icons/battery/battery-30.png").as_slice(),
        31..=40 => include_bytes!("../../../icons/battery/battery-40.png").as_slice(),
        41..=50 => include_bytes!("../../../icons/battery/battery-50.png").as_slice(),
        51..=60 => include_bytes!("../../../icons/battery/battery-60.png").as_slice(),
        61..=70 => include_bytes!("../../../icons/battery/battery-70.png").as_slice(),
        71..=80 => include_bytes!("../../../icons/battery/battery-80.png").as_slice(),
        81..=90 => include_bytes!("../../../icons/battery/battery-90.png").as_slice(),
        91..=100 => include_bytes!("../../../icons/battery/battery-100.png").as_slice(),
        _ => unreachable!(),
    };

    let tray_handle = app.tray_handle();
    tray_handle.set_icon(tauri::Icon::Raw(battery_icon.to_vec()))?;
    tray_handle.set_tooltip(&format!("{device_name} {battery_level}%"))
}

/// Update application tray icon & name
pub async fn default_tray(app: &tauri::AppHandle) -> tauri::Result<()> {
    let battery_icon = include_bytes!("../../../icons/icon.png").as_slice();

    let tray_handle = app.tray_handle();
    tray_handle.set_icon(tauri::Icon::Raw(battery_icon.to_vec()))?;
    tray_handle.set_tooltip("Getting bluetooth battery...")
}
