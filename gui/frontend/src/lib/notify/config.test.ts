import { beforeEach, describe, expect, it } from 'vitest';

import { STORAGE } from '@/lib/storage';

import { NOTIFY_CONFIG } from './config';

// Clear localStorage before each test to ensure isolation
beforeEach(() => {
  localStorage.clear();
});

describe('NOTIFY_CONFIG', () => {
  describe('get()', () => {
    it('should return the default config when no values are stored', () => {
      const config = NOTIFY_CONFIG.getOrDefault();

      expect(config.anchorOrigin).toEqual({
        vertical: 'top',
        horizontal: 'left',
      });
      expect(config.maxSnack).toBe(3);
    });

    it('should return the stored anchor position and snack limit', () => {
      STORAGE.set('snackbar-position', JSON.stringify({ vertical: 'top', horizontal: 'left' }));
      STORAGE.set('snackbar-limit', '5');

      const config = NOTIFY_CONFIG.getOrDefault();

      expect(config.anchorOrigin).toEqual({
        vertical: 'top',
        horizontal: 'left',
      });
      expect(config.maxSnack).toBe(5);
    });

    it('should fall back to default values when invalid data is stored', () => {
      STORAGE.set('snackbar-position', JSON.stringify({ vertical: 'middle', horizontal: 'down' }));
      STORAGE.set('snackbar-limit', 'NaN');

      const config = NOTIFY_CONFIG.getOrDefault();

      expect(config.anchorOrigin).toEqual({
        vertical: 'top',
        horizontal: 'left',
      });
      expect(config.maxSnack).toBe(3);
    });
  });

  describe('anchor.set()', () => {
    it('should store the anchor position', () => {
      const anchorOrigin = { vertical: 'top', horizontal: 'center' } as const;
      NOTIFY_CONFIG.anchor.set(anchorOrigin);

      const storedValue = STORAGE.get('snackbar-position');
      expect(storedValue).toBe(JSON.stringify(anchorOrigin));
    });
  });

  describe('anchor.fromStr()', () => {
    it('should parse a valid position string', () => {
      const result = NOTIFY_CONFIG.anchor.fromStr('top_left');
      expect(result).toEqual({ vertical: 'top', horizontal: 'left' });
    });

    it('should normalize an invalid position string', () => {
      const result = NOTIFY_CONFIG.anchor.fromStr('middle_center');
      expect(result).toEqual({ vertical: 'top', horizontal: 'center' });
    });
  });

  describe('limit.set()', () => {
    it('should store the maxSnack limit', () => {
      NOTIFY_CONFIG.limit.set(5);

      const storedValue = STORAGE.get('snackbar-limit');
      expect(storedValue).toBe('5');
    });
  });

  describe('limit.fromStr()', () => {
    it('should parse a valid snack limit', () => {
      const result = NOTIFY_CONFIG.limit.fromStr('10');
      expect(result).toBe(10);
    });

    it('should return default for invalid snack limit strings', () => {
      const result = NOTIFY_CONFIG.limit.fromStr('invalid');
      expect(result).toBe(NOTIFY_CONFIG.default.maxSnack);
    });
  });
});
