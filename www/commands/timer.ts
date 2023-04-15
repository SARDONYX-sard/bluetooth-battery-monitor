import { invoke } from "@tauri-apps/api";

/**
 * @param duration - seconds e.g 10 * 60
 * @returns return type of callback
 */
export async function update_info_interval(durationSec: number): Promise<void> {
  await invoke("update_info_interval", { durationSec });
}
