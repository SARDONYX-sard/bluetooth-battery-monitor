import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { z } from 'zod';

import { type Cache, STORAGE } from '@/lib/storage';

import { useStorageState } from './useStorageState';

const mockKey = 'log-level' satisfies keyof Cache;

// Define a basic Zod schema for validation
const logLevelSchema = z.enum(['debug', 'info', 'warn', 'error']);

describe('useStorageState', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should initialize with fallback state if no STORAGE value exists', () => {
    const { result } = renderHook(() => useStorageState(mockKey, logLevelSchema.catch('info')));

    expect(result.current[0]).toBe('info');
  });

  it('should initialize with STORAGE value if it exists and is valid', () => {
    STORAGE.set(mockKey, JSON.stringify('debug'));

    const { result } = renderHook(() => useStorageState(mockKey, logLevelSchema.catch('info')));

    expect(result.current[0]).toBe('debug');
  });

  it('should save a new value to STORAGE when updated', () => {
    const { result } = renderHook(() => useStorageState(mockKey, logLevelSchema.catch('info')));

    act(() => {
      result.current[1]('warn');
    });

    expect(result.current[0]).toBe('warn');
    expect(STORAGE.get(mockKey)).toBe(JSON.stringify('warn'));
  });

  it('should not update STORAGE if the value is the same as the current value', () => {
    STORAGE.set(mockKey, JSON.stringify('info'));

    const { result } = renderHook(() => useStorageState(mockKey, logLevelSchema.catch('info')));

    act(() => {
      result.current[1]('info');
    });

    expect(STORAGE.get(mockKey)).toBe(JSON.stringify('info'));
  });

  it('should handle objects correctly', () => {
    const objectSchema = z.object({ theme: z.string() }).catch({ theme: 'light' });
    const { result } = renderHook(() => useStorageState(mockKey, objectSchema));

    act(() => {
      result.current[1]({ theme: 'dark' });
    });

    expect(result.current[0]).toEqual({ theme: 'dark' });
    expect(STORAGE.get(mockKey)).toBe(JSON.stringify({ theme: 'dark' }));
  });

  it('should gracefully handle invalid JSON in STORAGE', () => {
    STORAGE.set(mockKey, 'invalidJSON');

    const { result } = renderHook(() => useStorageState(mockKey, logLevelSchema.catch('info')));

    // Should fall back to the default value provided in the schema
    expect(result.current[0]).toBe('info');
  });
});
