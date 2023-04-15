import { invoke } from "@tauri-apps/api";

type Device = {
  battery_level: number;
  bluetooth_address: string;
  class_of_device: string;
  device_name: string;
  friendly_name: string;
  instance_id: string;
  is_authenticated: boolean;
  is_connected: boolean;
  is_remembered: boolean;
  last_seen: SystemTime;
  last_used: SystemTime;
};
export type SystemTime = {
  day: number;
  day_of_week: number;
  hour: number;
  milliseconds: number;
  minute: number;
  month: number;
  second: number;
  year: number;
};
export type DeviceJson = Partial<Device>;

/**
 *
 * @param fn - e.g.  setter of useState
 * @returns return type of callback
 */
export async function get_bluetooth_info_all<T, U extends DeviceJson[] | []>(
  fn: (json_array: U) => T
) {
  const json_array = await invoke<U>("get_bluetooth_info_all");
  return fn(json_array);
}

/**
 * @param instanceId - e.g."BTHENUM\{0000111E-0000-1000-8000-00805F9B34FB}_LOCALMFG&005D\7&2CDD7520&0&9C431E0131A6_C00000000"
 * @param fn - e.g.  setter of useState
 * @returns return type of callback
 */
export async function get_bluetooth_info<T, U extends DeviceJson>(
  instanceId: string,
  fn: (json_array: U) => T
) {
  const json_array = await invoke<U>("get_bluetooth_info", {
    instanceId,
  });
  return fn(json_array);
}
