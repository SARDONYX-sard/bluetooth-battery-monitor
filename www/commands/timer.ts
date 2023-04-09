import { invoke } from "@tauri-apps/api";

/**
 * @param instanceId - e.g."BTHENUM\{0000111E-0000-1000-8000-00805F9B34FB}_LOCALMFG&005D\7&2CDD7520&0&9C431E0131A6_C00000000"
 * @param duration - seconds e.g 10 * 60
 * @returns return type of callback
 */
export async function update_info_interval(
  instanceId: string,
  duration: number
): Promise<void> {
  await invoke("update_info_interval", { instanceId, duration });
}
