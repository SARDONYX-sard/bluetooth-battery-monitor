use ab_glyph::{FontRef, PxScale};
use image::{Rgba, RgbaImage};
use imageproc::drawing::draw_text_mut;
use tauri::image::Image;

/// Get background color and text color based on the battery level
const fn get_colors(battery_level: u64, is_connected: bool) -> (Rgba<u8>, Rgba<u8>) {
    const GRAY: Rgba<u8> = Rgba([89, 89, 89, 255]);
    const RED: Rgba<u8> = Rgba([255, 0, 0, 255]);
    const WHITE: Rgba<u8> = Rgba([255, 255, 255, 255]);
    const BLUE: Rgba<u8> = Rgba([0, 128, 255, 255]);
    const BLACK: Rgba<u8> = Rgba([0, 0, 0, 255]);
    const YELLOW: Rgba<u8> = Rgba([255, 255, 0, 255]);

    if !is_connected {
        return (GRAY, WHITE);
    }

    match battery_level {
        0..=10 => (RED, WHITE),
        11..=30 => (YELLOW, BLACK),
        31.. => (BLUE, WHITE),
    }
}

/// Create a battery icon image
pub(crate) fn create_battery_image(
    width: u32,
    height: u32,
    battery_level: u64,
    is_connected: bool,
) -> Image<'static> {
    // Get the background color and text color
    let (background_color, text_color) = get_colors(battery_level, is_connected);

    // Create an image buffer for the icon
    let mut img = RgbaImage::from_pixel(width, height, background_color);

    // Load the font (use a system TTF file if necessary)
    let font_data = include_bytes!("../../../fonts/DejaVuSans/ttf/DejaVuSans.ttf");
    #[allow(clippy::expect_used)]
    let font = FontRef::try_from_slice(font_data).expect("Error loading font");

    // Set font size and text position
    let scale = PxScale {
        x: width as f32 * 0.80, // Scale relative to icon size
        y: height as f32 * 0.80,
    };
    let text = format!("{battery_level}"); // Convert battery level to string

    // Calculate text position to center it
    let text_width = (scale.x * text.len() as f32 * 0.5) as i32; // Approximate text width
    let text_x = (width as i32 - text_width) / 2;
    let text_y = (height as i32 - (scale.y as i32)) / 2;

    draw_text_mut(&mut img, text_color, text_x, text_y, scale, &font, &text);

    // Convert the buffer into a `tauri::image::Image`
    let rgba = img.into_raw();
    Image::new_owned(rgba, width, height)
}
