import { CACHE_KEYS, HIDDEN_CACHE_KEYS, PUB_CACHE_KEYS } from './cacheKeys';
import { createStorage } from './storage';

import type { LocalCache } from './types';

type Mutable<T> = { -readonly [P in keyof T]: T[P] };

export { PUB_CACHE_KEYS, CACHE_KEYS };
/** key/value pairs related to this project. */
export type Cache = LocalCache<typeof CACHE_KEYS>;
export type CacheKey = keyof Cache;
export type CacheKeyWithHide = CacheKey | Mutable<typeof HIDDEN_CACHE_KEYS>[number];

export const STORAGE = createStorage({
  cacheKeys: CACHE_KEYS,
  _hiddenKeys: HIDDEN_CACHE_KEYS,
});
