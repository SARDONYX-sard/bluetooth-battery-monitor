import { isTauri } from '@tauri-apps/api/core';
import { getCurrentWindow } from '@tauri-apps/api/window';

/** HACK: Avoid blank white screen on load.
 * - https://github.com/tauri-apps/tauri/issues/5170#issuecomment-2176923461
 * - https://github.com/tauri-apps/tauri/issues/7488
 */
export function showWindow() {
  if (typeof window !== 'undefined' && isTauri()) {
    getCurrentWindow().show();
  }
}
