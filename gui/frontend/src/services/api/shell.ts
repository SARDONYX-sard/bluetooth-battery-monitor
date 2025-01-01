import { open } from '@tauri-apps/plugin-shell';

import { NOTIFY } from '@/lib/notify';

/**
 * Wrapper tauri's `open` with `notify.error`
 *
 * # Why need this?
 * Use the backend api to jump to the link so that it can be opened in the default browser without opening it in the webview.
 *
 * @export
 * @param {string} path
 * @param {string} [openWith]
 */
export async function start(path: string, openWith?: string) {
  await NOTIFY.asyncTry(async () => await open(path, openWith));
}
