import { save } from '@tauri-apps/api/dialog';

import { readFile, writeFile } from '@/backend_api';
import { type LocalCache, cacheKeys, localStorageManager } from '@/utils/local_storage_manager';

import tauriJson from '../../../backend/tauri.conf.json';

const frontConfigPath = `${tauriJson.package.productName}_front_config` as const;

export const backup = {
  /** @throws Error */
  async import() {
    const pathKey = 'import-backup-path';
    const settings = await readFile(pathKey, frontConfigPath);
    if (settings) {
      const obj = JSON.parse(settings);

      // Validate
      for (const key of Object.keys(obj)) {
        // The import path does not need to be overwritten.
        if (key === pathKey) {
          return;
        }
        // Remove invalid settings values
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        if (!cacheKeys.includes(key as any)) {
          delete obj[key];
        }
      }

      return obj as LocalCache;
    }
  },

  /** @throws Error */
  async export(settings: LocalCache) {
    const pathKey = 'export-settings-path';
    const cachedPath = localStorageManager.get(pathKey);
    const path = await save({
      defaultPath: cachedPath ?? undefined,
      filters: [
        {
          name: frontConfigPath,
          extensions: ['json'],
        },
      ],
    });

    if (typeof path === 'string') {
      await writeFile(path, `${JSON.stringify(settings, null, 2)}\n`);
      return path;
    }
    return null;
  },
};
