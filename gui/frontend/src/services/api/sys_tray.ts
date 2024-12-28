import { invoke } from '@tauri-apps/api/core';

export async function updateTrayIcon(deviceName: string, batteryLevel: number) {
  await invoke('update_tray_icon', { deviceName, batteryLevel });
}

export async function defaultTrayIcon() {
  await invoke('set_default_tray_icon');
}
