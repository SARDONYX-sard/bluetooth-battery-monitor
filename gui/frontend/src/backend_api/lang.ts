import { readFile } from '.';

/**
 * Read the entire contents of a file into a string.
 * @param {string} path - target path
 * @return [isCancelled, contents]
 * @throws
 */
export async function importLang() {
  return await readFile('lang-file-path', 'Custom Language');
}
