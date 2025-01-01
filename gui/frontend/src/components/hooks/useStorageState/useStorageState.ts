import { type Dispatch, type SetStateAction, useEffect, useState } from 'react';

import type { CacheKeyWithHide } from '@/lib/storage';
import { stringToJsonSchema } from '@/lib/zod/json-validation';

import type { ZodCatch, ZodType } from 'zod';

/**
 * A custom React hook that syncs state with `localStorage`.
 *
 * This hook behaves like `useState`, but persists the state in `localStorage`.
 * It validates the state using a Zod schema and ensures type safety. If the `catch` method is not used in the schema,
 * it can lead to unexpected errors (panics).
 *
 * @template T - The type of the state value.
 * @param {string} key - The key to store the value in `localStorage`.
 * @param {z.ZodType<T>} schema - The Zod schema to validate and parse the state value.
 *
 * @returns {[T, (newValue: T) => void]} A stateful value and a function to update it, which also updates `localStorage`.
 *
 * @example
 * // Using a string enum with a fallback using `.catch()`:
 * const [option, setOption] = useStorageState('option', z.enum(['a', 'b', 'c']).catch('a'));
 *
 * // Using an object schema with a fallback using `.catch()`:
 * const [settings, setSettings] = useStorageState('settings', z.object({ theme: z.string() }).catch({ theme: 'light' }));
 *
 * @description
 * # Note
 * In schema, `.catch()` must always be called. Otherwise, an unhandled error will occur.
 */
export function useStorageState<T extends ZodType<U>, U = unknown>(
  key: CacheKeyWithHide,
  schema: ZodCatch<T>,
): StateTuple<T, U> {
  const [value, setValue] = useState(getCacheValue(key, schema));

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [value, key]);

  return [value, setValue] as const;
}

/** Return value of useState with ZodCatch */
export type StateTuple<T extends ZodType<U>, U = unknown> = [T['_output'], Dispatch<SetStateAction<T['_output']>>];

/** Helper function to retrieve the cache value and parse it with Zod schema, applying fallback with catch and default */
const getCacheValue = <T extends ZodType<U>, U = unknown>(key: CacheKeyWithHide, schema: ZodCatch<T>): T['_output'] => {
  return stringToJsonSchema.catch(null).pipe(schema).parse(localStorage.getItem(key));
};
