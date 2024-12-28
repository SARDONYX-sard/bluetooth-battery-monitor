import { invoke } from '@tauri-apps/api/core';

export type BluetoothDeviceInfo = {
  /** e.g. `E500Pro Hands-Free AG` */
  // biome-ignore lint/style/useNamingConvention: <explanation>
  friendly_name: string;

  /** e.g. `BTHENUM\\{0000111E-0000-1000-8000-00805F9B34FB}_LOCALMFG&005D...` */
  // biome-ignore lint/style/useNamingConvention: <explanation>
  instance_id: string;

  address: number;

  /** e.g. 80(%) */
  // biome-ignore lint/style/useNamingConvention: <explanation>
  battery_level: number;

  category: string;

  // biome-ignore lint/style/useNamingConvention: <explanation>
  is_connected: boolean;

  /**
   * Native time
   * e.g. `2024/4/19 22:42:16`
   */
  // biome-ignore lint/style/useNamingConvention: <explanation>
  last_used: string;
};

/**
 * Find bluetooth devices information.
 * @throws `Error`
 */
export async function FindBluetoothDevices() {
  return await invoke<BluetoothDeviceInfo[]>('find_bluetooth_devices');
}

/**
 * Restart interval to get bluetooth device information.
 * @throws `Error`
 */
export async function restartInterval() {
  await invoke('restart_interval');
}
