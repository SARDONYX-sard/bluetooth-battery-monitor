import { useCallback, useState } from 'react';

import type { CacheKey } from '@/utils/local_storage_manager';

type CacheKeyAll = CacheKey | 'runScript';
const getCacheStr = (cacheKey: CacheKeyAll, initialState: string) => localStorage.getItem(cacheKey) ?? initialState;

/**
 * useState with localStorage
 * @param keyName
 * @param fallbackState - if localStorage.getItem is returned null, then use.
 */
export function useStorageState(keyName: CacheKeyAll, fallbackState = '') {
  const [value, setValue] = useState(getCacheStr(keyName, fallbackState));

  const setState = useCallback(
    (newValue: string) => {
      setValue(newValue);
      if (value !== newValue) {
        localStorage.setItem(keyName, newValue);
      }
    },
    [keyName, value],
  );

  return [value, setState] as const;
}
