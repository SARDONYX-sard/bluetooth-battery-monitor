import { invoke } from '@tauri-apps/api/core';
import { z } from 'zod';

export const BluetoothDeviceInfoSchema = z
  .object({
    /** e.g. `E500Pro Hands-Free AG` */
    // biome-ignore lint/style/useNamingConvention: <explanation>
    friendly_name: z.string(),

    /** e.g. `BTHENUM\\{0000111E-0000-1000-8000-00805F9B34FB}_LOCALMFG&005D...` */
    // biome-ignore lint/style/useNamingConvention: <explanation>
    instance_id: z.string(),

    address: z.number(),

    /** e.g. 80(%) */
    // biome-ignore lint/style/useNamingConvention: <explanation>
    battery_level: z.number(),

    category: z.string(),

    // biome-ignore lint/style/useNamingConvention: <explanation>
    is_connected: z.boolean(),

    /**
     * Native time. e.g. `2024/4/19 22:42:16`
     */
    // biome-ignore lint/style/useNamingConvention: <explanation>
    last_used: z.string(),

    /**
     * Native time. e.g. `2024/4/19 22:42:16`
     */
    // biome-ignore lint/style/useNamingConvention: <explanation>
    last_updated: z.string(),
  })
  .catch({
    // biome-ignore lint/style/useNamingConvention: <explanation>
    friendly_name: 'Unknown',
    // biome-ignore lint/style/useNamingConvention: <explanation>
    instance_id: 'Unknown',
    address: 0,
    // biome-ignore lint/style/useNamingConvention: <explanation>
    battery_level: 0,
    category: 'Unknown',
    // biome-ignore lint/style/useNamingConvention: <explanation>
    is_connected: false,
    // biome-ignore lint/style/useNamingConvention: <explanation>
    last_used: 'Unknown',
    // biome-ignore lint/style/useNamingConvention: <explanation>
    last_updated: 'Unknown',
  });

// Optional: Create a TypeScript type from the schema for type safety.
export type BluetoothDeviceInfo = z.infer<typeof BluetoothDeviceInfoSchema>;

export type Devices = Record<number, BluetoothDeviceInfo>;

/**
 * Restart device watcher to get bluetooth devices information.
 * @throws `Error`
 */
export async function restartDeviceWatcher() {
  await invoke('restart_device_watcher');
}

/**
 * Get devices information
 * @throws `Error`
 */
export async function getDevices() {
  return await invoke<Devices>('get_devices');
}

/**
 * Restart interval to get bluetooth device information.
 * @throws `Error`
 */
export async function restartInterval() {
  await invoke('restart_interval');
}
