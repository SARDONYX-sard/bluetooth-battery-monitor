/**
 * Type representing the available cache keys for storage.
 * The keys are defined in the cacheKeys.ts file and depend on the environment.
 */
export type CacheKey<K extends readonly string[]> = K[number];

/**
 * Type representing hidden cache keys, typically used for sensitive or internal data.
 */
export type HiddenCacheKey<H extends readonly string[]> = H[number];

/**
 * Type representing a partial key-value map for cached data.
 * Each key maps to a string value in the local storage.
 */
export type LocalCache<K extends readonly string[]> = Partial<Record<CacheKey<K>, string>>;
