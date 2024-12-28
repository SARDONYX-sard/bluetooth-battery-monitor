import { invoke } from '@tauri-apps/api/core';
import { readTextFile } from '@tauri-apps/plugin-fs';
import { z } from 'zod';

import type { CacheKey } from '@/lib/storage';
import { schemaStorage } from '@/lib/storage/schemaStorage';

import { openPath } from './dialog';

/**
 * Reads the entire contents of a file into a string.
 *
 * @param pathCacheKey - Target path cache key.
 * @param filterName - Name of the filter to be displayed in the file dialog.
 * @param extensions - Array of file extensions to be filtered in the file dialog. Default is `['json']`.
 *
 * @returns A promise that resolves to the contents of the file if successful, or `null` if the user cancels the file dialog.
 *
 * @throws Throws an `Error` if there is an issue reading the file.
 */
export async function readFile(pathCacheKey: CacheKey, filterName: string, extensions = ['json']) {
  const [path, setPath] = schemaStorage.use(pathCacheKey, z.string());
  const selectedPath = await openPath(path ?? '', {
    setPath,
    filters: [{ name: filterName, extensions }],
    multiple: false,
  });

  if (typeof selectedPath === 'string') {
    return await readTextFile(selectedPath);
  }
  return null;
}

/**
 * Alternative file writing API to avoid tauri API bug.
 *
 * # NOTE
 * We couldn't use `writeTextFile`!
 * - The `writeTextFile` of tauri's api has a bug that the data order of some contents is unintentionally swapped.
 * @param path - path to write
 * @param content - string content
 * @throws Error
 */
export async function writeFile(path: string, content: string) {
  await invoke('write_file', { path, content });
}
