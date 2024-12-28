import { type CacheKey, STORAGE } from '@/lib/storage';
import { stringToJsonSchema } from '@/lib/zod/json-validation';

import type { z } from 'zod';

/**
 * Provides methods for interacting with a storage system with schema validation.
 *
 * NOTE: Use `useStorageState` if you rely on `React.useState`.
 */
export const schemaStorage = {
  /**
   * Retrieves and validates data from storage.
   *
   * @template T - The type of the data.
   * @param {CacheKey} key - The key to retrieve the data from storage.
   * @param {z.ZodType<T>} schema - The Zod schema used for validation.
   * @returns {T | null} - The parsed data if valid, otherwise `null`.
   */
  get<T>(key: CacheKey, schema: z.ZodType<T>): T | null {
    const data = STORAGE.get(key);
    const result = stringToJsonSchema.catch(null).pipe(schema).safeParse(data);

    if (result.success) {
      return result.data;
    }
    return null;
  },

  /**
   * Stores data in storage as a JSON string.
   *
   * @template T - The type of the value to be stored.
   * @param {CacheKey} key - The key to store the data under.
   * @param {T} value - The value to store.
   * @returns {void}
   */
  set<T>(key: CacheKey, value: T): void {
    STORAGE.set(key, JSON.stringify(value));
  },

  /**
   * Retrieves and validates data from storage, and returns it along with a function to update the value.
   *
   * @template T - The type of the data.
   * @param {CacheKey} key - The key to retrieve the data from storage.
   * @param {z.ZodType<T>} schema - The Zod schema used for validation.
   * @returns {[T | null, (value: T) => void]} - A tuple containing the parsed data and a function to set the value.
   */
  use<T>(key: CacheKey, schema: z.ZodType<T>): [T | null, (value: T) => void] {
    const value = this.get(key, schema);
    const setValue = (newValue: T) => {
      this.set(key, newValue);
    };

    return [value, setValue];
  },
};
