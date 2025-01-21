import { invoke } from '@tauri-apps/api/core';

/** set device info icon */
export async function updateTrayIcon(deviceName: string, batteryLevel: number, isConnected: boolean) {
  await invoke('update_tray', { deviceName, batteryLevel, isConnected });
}

/** set Loading tray icon */
export async function defaultTrayIcon() {
  await invoke('default_tray');
}
