const formPubCacheKeys = ['logLevel'] as const;
const formPrivateCacheKeys = [] as const;

export const pubCacheKeys = [
  ...formPubCacheKeys,
  'custom-translation-dict',
  'customCSS',
  'customJS',
  'editor-tab-select',
  'editorMode',
  'locale',
  'presetNumber',
  'settings-tab-select',
  'snackbar-limit',
  'snackbar-position',
] as const;
export const privateCacheKeys = [
  ...formPrivateCacheKeys,
  'import-backup-path',
  'import-settings-path',
  'export-settings-path',
  'lang-file-path',
] as const;
export const cacheKeys = [...pubCacheKeys, ...privateCacheKeys];

export type CacheKey = (typeof cacheKeys)[number];
export type LocalCache = Partial<{ [Key in CacheKey]: string }>;

/** Wrapper for type completion of keys to be cached */
export const localStorageManager = {
  /**
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Storage/getItem)
   * @returns
   * - Value associated with the given key
   * - `null` if the given key does not exist.
   */
  get(key: CacheKey) {
    return localStorage.getItem(key);
  },
  getFromKeys(keys: CacheKey[]) {
    const res: LocalCache = {};

    for (const key of keys) {
      const value = localStorageManager.get(key);
      if (value) {
        res[key] = value;
      }
    }

    return res;
  },
  /** Get all cache */
  getAll() {
    const res: LocalCache = {};

    for (const key of cacheKeys) {
      const val = localStorageManager.get(key);
      if (val) {
        res[key] = val;
      }
    }

    return res;
  },
  /** Set cache */
  set(key: CacheKey, value: string) {
    return localStorage.setItem(key, value);
  },
  removeFromKeys(keys: CacheKey[]) {
    for (const key of keys) {
      localStorage.removeItem(key);
    }
  },
};
