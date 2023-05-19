mod common;
#[cfg(target_os = "windows")]
pub mod windows;

#[cfg(target_os = "windows")]
pub use self::windows as sys;

#[cfg(test)]
mod tests {
    use crate::bluetooth::sys::get_bluetooth_info_all;
    use std::{fs::File, io::Write};

    #[test]
    fn print_bluetooth_devices() {
        let devices_info = get_bluetooth_info_all().unwrap();
        println!("{}", devices_info);
        let mut file = File::create("devices.json").unwrap();
        file.write_all(devices_info.to_string().as_bytes()).unwrap();
    }
}
