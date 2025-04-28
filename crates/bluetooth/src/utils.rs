/// play sound notifications using the Windows API.
///
/// # Main use
/// This auxiliary function is intended to be used as a notification sound for battery level.
///
/// # Errors
/// Returns an error if the sound notification fails to play.
pub fn play_asterisk() -> windows::core::Result<()> {
    use windows::Win32::System::Diagnostics::Debug::MessageBeep;
    use windows::Win32::UI::WindowsAndMessaging::MB_ICONASTERISK;

    unsafe { MessageBeep(MB_ICONASTERISK) }
}

/// Open the Bluetooth settings menu in Windows.
///
/// - See: [Launch the Windows Settings app](https://learn.microsoft.com/en-us/windows/apps/develop/launch/launch-settings-app)
///
/// # Errors
/// Returns an error if the settings fails to open.
pub async fn open_bluetooth_menu() -> windows::core::Result<bool> {
    use windows::core::h;
    use windows::Foundation::Uri;
    use windows::System::Launcher;

    let uri = Uri::CreateUri(h!("ms-settings:bluetooth"))?;
    Launcher::LaunchUriAsync(&uri)?.await
}
