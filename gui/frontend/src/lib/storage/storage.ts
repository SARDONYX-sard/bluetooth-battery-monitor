// import { CACHE_KEYS, HIDDEN_CACHE_KEYS } from './cacheKeys';
import type { CacheKey, HiddenCacheKey, LocalCache } from './types';

/**
 * Factory function to create a localStorage wrapper for managing cache keys.
 * It provides utility methods to get, set, and remove cache values.
 *
 * @template K - The type of all cache keys derived from provided cache keys.
 * @template H - The type of hidden cache keys.
 * @param cacheKeys - Array of cache keys to be managed.
 * @returns - Storage utilities for managing localStorage cache.
 */
export const createStorage = <
  K extends readonly string[] = never[], // Ensure K has a value specified
  H extends readonly string[] = never[], // Ensure K has a value specified
>({
  cacheKeys,
}: { cacheKeys: K; _hiddenKeys?: H }) => {
  return {
    /**
     * Retrieves the value from localStorage for the given cache key.
     * @param key - The cache key to retrieve.
     * @example
     * storage.get('snackbar-limit');
     */
    get: (key: CacheKey<K>) => localStorage.getItem(key),

    /**
     * Retrieves the values for multiple cache keys from localStorage.
     * @param keys - Array of cache keys to retrieve.
     * @example
     * storage.getByKeys(['snackbar-limit', 'locale']);
     */
    getByKeys(keys: readonly CacheKey<K>[]) {
      return keys.reduce<LocalCache<K>>((res, key) => {
        const value = this.get(key);
        if (value) {
          res[key] = value;
        }
        return res;
      }, {});
    },

    /**
     * Retrieves all cache values for the defined cache keys.
     * @example
     * storage.getAll();
     */
    getAll() {
      return this.getByKeys(cacheKeys);
    },

    /**
     * Sets a value in localStorage for a given cache key.
     * @param key - The cache key to set.
     * @param value - The value to store.
     * @example
     * storage.set('snackbar-limit', '5');
     */
    set(key: CacheKey<K>, value: string) {
      localStorage.setItem(key, value);
    },

    /**
     * Removes a value from localStorage for a given cache key.
     * @param key - The cache key to remove.
     * @example
     * storage.remove('locale');
     */
    remove(key: CacheKey<K>) {
      localStorage.removeItem(key);
    },

    /**
     * Retrieves the value for a hidden cache key from localStorage.
     * @param key - The hidden cache key to retrieve.
     * @example
     * storage.getHidden('run-script');
     */
    getHidden: (key: HiddenCacheKey<H>) => localStorage.getItem(key),
    /**
     * Set the value for a hidden cache key from localStorage.
     * @param key - The hidden cache key
     * @param value - string value
     * @example
     * storage.setHidden('run-script', 'true');
     */
    setHidden: (key: HiddenCacheKey<H>, value: string) => localStorage.setItem(key, value),
  } as const;
};
