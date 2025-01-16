import { invoke } from '@tauri-apps/api/core';

export async function updateTrayIcon(deviceName: string, batteryLevel: number) {
  await invoke('update_tray', { deviceName, batteryLevel });
}

export async function defaultTrayIcon() {
  await invoke('default_tray');
}
