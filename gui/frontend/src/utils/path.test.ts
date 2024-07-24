import { getParent } from '@/utils/path';

describe('get_parent function', () => {
  test('returns the same path if it ends with /', () => {
    const path = '/example/path/';
    expect(getParent(path)).toBe(path);
  });

  test('returns the same path if it ends with \\', () => {
    const path = '\\example\\path\\';
    expect(getParent(path)).toBe(path);
  });

  test('deletes tailing part until / if path does not end with /', () => {
    const path = '/example/path/file.txt';
    const expected = '/example/path';
    expect(getParent(path)).toBe(expected);
  });

  test('deletes tailing part until \\ if path does not end with \\', () => {
    const path = '\\example\\path\\file.txt';
    const expected = '\\example\\path';
    expect(getParent(path)).toBe(expected);
  });
});
