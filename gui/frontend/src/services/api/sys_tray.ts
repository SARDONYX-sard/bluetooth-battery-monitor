import { invoke } from '@tauri-apps/api/core';

export async function updateTrayIcon(deviceName: string, batteryLevel: number, isConnected: boolean) {
  await invoke('update_tray', { deviceName, batteryLevel, isConnected });
}

export async function defaultTrayIcon() {
  await invoke('default_tray');
}
