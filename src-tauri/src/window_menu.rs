use tauri::{CustomMenuItem, Menu, Submenu, WindowMenuEvent};

pub fn create_menu() -> Menu {
    let quit = CustomMenuItem::new("quit".to_string(), "Quit");
    let submenu = Submenu::new("File", Menu::new().add_item(quit));

    Menu::new().add_submenu(submenu)
}

pub fn menu_event(event: WindowMenuEvent) {
    if let "quit" = event.menu_item_id() {
        std::process::exit(0);
    }
}
