import { invoke } from '@tauri-apps/api/core';

export type Config = {
  /** e.g. `BTHENUM\\{0000111E-0000-1000-8000-00805F9B34FB}_LOCALMFG&005D...` */
  // biome-ignore lint/style/useNamingConvention: <explanation>
  instance_id: string;

  /** e.g. `60`(minutes) == 1hour */
  // biome-ignore lint/style/useNamingConvention: <explanation>
  battery_query_duration_minutes: number;

  /** e.g. `20`(%) */
  // biome-ignore lint/style/useNamingConvention: <explanation>
  notify_battery_level: number;
};

export const config = {
  default: {
    // biome-ignore lint/style/useNamingConvention: <explanation>
    instance_id: '',
    // biome-ignore lint/style/useNamingConvention: <explanation>
    battery_query_duration_minutes: 60,
    // biome-ignore lint/style/useNamingConvention: <explanation>
    notify_battery_level: 20,
  },

  /**
   * Read bluetooth finder configuration
   */
  async read() {
    return await invoke<Config>('read_config');
  },

  /**
   * Read bluetooth finder configuration
   */
  async write(config: Config) {
    await invoke('write_config', { config });
  },
};
