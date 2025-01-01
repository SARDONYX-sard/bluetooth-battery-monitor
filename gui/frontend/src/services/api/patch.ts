import { invoke } from '@tauri-apps/api/core';

export type ModInfo = {
  id: string;
  name: string;
  author: string;
  site: string;
  auto: string;
};

export type ModIds = readonly string[];

/**
 * Load mods `info.ini`
 * @throws Error
 */
export async function loadModsInfo(searchGlob: string) {
  return await invoke<ModInfo[]>('load_mods_info', { glob: searchGlob });
}

/**
 * Load activate mods id
 * @example ['aaa', 'bbb']
 * @throws Error
 */
export async function patch(output: string, ids: ModIds) {
  await invoke('patch', { output, ids });
}
