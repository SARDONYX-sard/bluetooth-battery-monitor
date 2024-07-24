import { act, cleanup, renderHook } from '@testing-library/react';

import { useStorageState } from '@/hooks';
import type { CacheKey } from '@/utils/local_storage_manager';

afterEach(() => {
  cleanup();
});

describe('useStorageState hook', () => {
  it('should set and get value from state', () => {
    const storageKey: CacheKey = 'cached-dst';
    const initialValue = 'initialValue';

    const { result } = renderHook(() => useStorageState(storageKey, initialValue));
    expect(result.current[0]).toBe(initialValue);

    const newValue = 'newValue';
    act(() => result.current[1](newValue));
    expect(result.current[0]).toBe(newValue);
  });
});
