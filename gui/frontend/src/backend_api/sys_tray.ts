import { invoke } from '@tauri-apps/api';

export async function updateTrayIcon(deviceName: string, batteryLevel: number) {
  await invoke('update_tray_icon', { deviceName, batteryLevel });
}
