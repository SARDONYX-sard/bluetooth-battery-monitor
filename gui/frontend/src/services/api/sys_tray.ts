import { invoke } from '@tauri-apps/api/core';

export type IconType = 'circle' | 'number_box';

export const normalizeIconType = (iconType: string): IconType => {
  return iconType.toLowerCase() === 'circle' ? 'circle' : 'number_box';
};

/** set device info icon */
export async function updateTrayIcon(
  deviceName: string,
  batteryLevel: number,
  isConnected: boolean,
  iconType: IconType,
): Promise<void> {
  await invoke('update_tray', { deviceName, batteryLevel, isConnected, iconType });
}

/** set Loading tray icon */
export async function defaultTrayIcon() {
  await invoke('default_tray');
}
