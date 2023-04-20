import { invoke } from "@tauri-apps/api";

export type SettingsJson = {
  base: {
    autostart: boolean;
    battery_query_duration_minutes: number;
    notify_battery_level: number;
  };
};

export const DEFAULT_SETTINGS = {
  base: {
    autostart: true,
    battery_query_duration_minutes: 60,
    notify_battery_level: 20,
  },
} as const satisfies SettingsJson;

/**
 * @param value
 */
export async function write_settings(settingsObj: SettingsJson) {
  try {
    await invoke("write_settings", { settingsObj });
  } catch (err) {
    console.error(err);
  }
}

/**
 */
export async function read_settings() {
  let res: SettingsJson;
  try {
    res = await invoke<SettingsJson>("read_settings");
    return res;
  } catch (err) {
    console.error(err);
  }
}

/**
 */
export async function delete_settings() {
  let res: SettingsJson;
  try {
    res = await invoke<SettingsJson>("read_settings");
    return res;
  } catch (err) {
    console.error(err);
  }
}
