import { save } from '@tauri-apps/plugin-dialog';

import { CACHE_KEYS, type Cache, STORAGE } from '@/lib/storage';
import { PRIVATE_CACHE_OBJ } from '@/lib/storage/cacheKeys';
import { stringToJsonSchema } from '@/lib/zod/json-validation';

import { readFile, writeFile } from './fs';

const SETTINGS_FILE_NAME = 'settings';

export const BACKUP = {
  /** @throws Error | JsonParseError */
  async import(): Promise<Cache | undefined> {
    const settings = await readFile(PRIVATE_CACHE_OBJ.importSettingsPath, SETTINGS_FILE_NAME);
    if (settings) {
      const json = stringToJsonSchema.parse(settings);

      // Validate
      if (typeof json === 'object' && !Array.isArray(json) && json !== null) {
        for (const key of Object.keys(json)) {
          // NOTE: The import path selected immediately before should remain selectable the next time, so do not overwrite it.
          if (key === PRIVATE_CACHE_OBJ.importSettingsPath) {
            continue;
          }

          const isInvalidKey = !CACHE_KEYS.some((cacheKey) => cacheKey === key);
          if (isInvalidKey) {
            delete json[key];
          }
        }

        return json as Partial<Record<string, string>>;
      }
    }
  },

  /** @throws SaveError */
  async export(settings: Cache) {
    const cachedPath = STORAGE.get(PRIVATE_CACHE_OBJ.exportSettingsPath);
    const path = await save({
      defaultPath: cachedPath ?? 'settings.json',
      filters: [{ name: SETTINGS_FILE_NAME, extensions: ['json'] }],
    });

    if (typeof path === 'string') {
      await writeFile(path, `${JSON.stringify(settings, null, 2)}\n`);
      return path;
    }
    return null;
  },
} as const;
