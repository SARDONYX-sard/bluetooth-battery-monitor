import { invoke } from "@tauri-apps/api";

/**
 * @param durationMins - minutes e.g 60 (60min)
 * @returns return type of callback
 */
export async function update_info_interval(
  durationMins: number
): Promise<void> {
  try {
    await invoke("update_info_interval", { durationMins });
  } catch (error) {
    console.error(error);
  }
}
