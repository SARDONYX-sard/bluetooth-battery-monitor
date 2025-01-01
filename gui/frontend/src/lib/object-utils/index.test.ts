/**
 * @vitest-environment node
 *
 * - ref: https://vitest.dev/config/#environment
 */
import { describe, expect, it } from 'vitest';

import { OBJECT } from './';

describe('OBJECT.keys', () => {
  it('should return the correct keys for a given object', () => {
    const obj = { a: 1, b: 'test', c: true };
    const keys = OBJECT.keys(obj);

    expect(keys).toEqual(['a', 'b', 'c']);
    expect(keys).toContain('a');
    expect(keys).toContain('b');
    expect(keys).toContain('c');
  });

  it('should correctly infer key types', () => {
    const obj = { x: 42, y: 'example' };
    const keys = OBJECT.keys(obj);

    // Ensure that the inferred type is correct
    expect(typeof keys[0]).toBe('string');
  });
});

describe('OBJECT.entries', () => {
  it('should return correct key-value pairs for a given object', () => {
    const obj = { a: 1, b: 'test', c: true };
    const entries = OBJECT.entries(obj);

    expect(entries).toEqual([
      ['a', 1],
      ['b', 'test'],
      ['c', true],
    ]);
  });

  it('should correctly infer value types', () => {
    const obj = { x: 42, y: 'example', z: false };
    const entries = OBJECT.entries(obj);

    for (const [key, value] of entries) {
      if (key === 'x') {
        expect(typeof value).toBe('number');
      }
      if (key === 'y') {
        expect(typeof value).toBe('string');
      }
      if (key === 'z') {
        expect(typeof value).toBe('boolean');
      }
    }
  });
});
