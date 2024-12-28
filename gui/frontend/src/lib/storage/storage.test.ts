import { beforeEach, describe, expect, it } from 'vitest';

import { createStorage } from './storage';

describe('Storage Utility', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  const testHiddenKeys = ['hidden-key'] as const;
  const testKeys = ['key1', 'key2', ...testHiddenKeys] as const;
  const storage = createStorage({ cacheKeys: testKeys, _hiddenKeys: testHiddenKeys });

  it('should set and get a cache item', () => {
    storage.set('key1', 'value1');
    expect(storage.get('key1')).toBe('value1');
  });

  it('should return null for non-existing value', () => {
    expect(storage.get('key1')).toBe(null);
  });

  it('should retrieve values for multiple cache keys', () => {
    storage.set('key1', 'value1');
    storage.set('key2', 'value2');

    const result = storage.getByKeys(['key1', 'key2']);
    expect(result).toEqual({ key1: 'value1', key2: 'value2' });
  });

  it('should return an empty object for no matching keys', () => {
    const result = storage.getByKeys([]);
    expect(result).toEqual({});
  });

  it('should retrieve all cache values for defined keys', () => {
    storage.set('key1', 'value1');
    storage.set('key2', 'value2');

    const result = storage.getAll();
    expect(result).toEqual({ key1: 'value1', key2: 'value2' });
  });

  it('should remove a cache item', () => {
    storage.set('key1', 'value1');
    storage.remove('key1');
    expect(storage.get('key1')).toBe(null);
  });

  it('should retrieve a value for a hidden cache key', () => {
    storage.set('hidden-key', 'hiddenValue');
    expect(storage.getHidden('hidden-key')).toBe('hiddenValue');
  });

  it('should return null for non-existing hidden value', () => {
    expect(storage.getHidden('hidden-key')).toBe(null);
  });
});
