import { STORAGE } from '@/lib/storage';
import { PUB_CACHE_OBJ } from '@/lib/storage/cacheKeys';
import { stringToJsonSchema } from '@/lib/zod/json-validation';

import { snackbarLimitSchema, snackbarOriginSchema } from './schema';

import type { SnackbarOrigin } from 'notistack';

/**
 * Type representing the configuration for the notification system.
 */
export type NotifyConfig = {
  /** Determines where the notification will appear on the screen. */
  anchorOrigin: SnackbarOrigin;
  /** Maximum number of snack_bars to display simultaneously. */
  maxSnack: number;
};

/**
 * Default notification configuration.
 */
const DEFAULT = {
  anchorOrigin: {
    horizontal: 'left',
    vertical: 'top',
  },
  maxSnack: 3,
} as const satisfies NotifyConfig;

/**
 * Utility function to normalize the position values for the Snackbar.
 * Ensures that the vertical and horizontal values fall within acceptable limits.
 *
 * @param param0 - The partial object containing vertical and horizontal position values.
 * @returns - The normalized Snackbar position.
 */
const normalize = (value: Partial<{ vertical: string; horizontal: string }>) => {
  return snackbarOriginSchema.parse(value) satisfies SnackbarOrigin;
};

/**
 * Main configuration object for the notification system. This handles setting and retrieving
 * the notification configuration, including the anchor position and maximum snack count.
 */
export const NOTIFY_CONFIG = {
  /**
   * The default configuration.
   */
  default: DEFAULT,

  /**
   * Retrieves the current notification configuration from storage, falling back to defaults if necessary.
   *
   * @returns - The current notification configuration.
   */
  getOrDefault() {
    const anchorOrigin = stringToJsonSchema
      .catch(null)
      .pipe(snackbarOriginSchema)
      .parse(STORAGE.get(PUB_CACHE_OBJ.snackbarPosition));
    const maxSnack = stringToJsonSchema
      .catch(null)
      .pipe(snackbarLimitSchema)
      .parse(STORAGE.get(PUB_CACHE_OBJ.snackbarLimit));

    return { anchorOrigin, maxSnack } as const satisfies NotifyConfig;
  },

  /**
   * Sub-object for managing the `anchorOrigin` configuration.
   */
  anchor: {
    /**
     * Sets the anchor position and stores it.
     *
     * @param value - The new anchor position.
     */
    set(value: NotifyConfig['anchorOrigin']) {
      STORAGE.set('snackbar-position', JSON.stringify(value));
    },

    /**
     * Parses a string in the format "vertical_horizontal" to set the anchor position.
     *
     * @param str - The position string.
     * @returns - The parsed anchor position.
     */
    fromStr(str: string): SnackbarOrigin {
      const [vertical, horizontal] = str.split('_');
      return normalize({ vertical, horizontal });
    },
  },

  /**
   * Sub-object for managing the maximum snack count configuration.
   */
  limit: {
    /**
     * Sets the maximum snack limit and stores it.
     *
     * value - The new maximum snack limit.
     */
    set(value: NotifyConfig['maxSnack']) {
      STORAGE.set(PUB_CACHE_OBJ.snackbarLimit, JSON.stringify(value));
    },

    /**
     * Parses a string to set the maximum snack limit.
     *
     * @param str - The string representation of the snack limit.
     * @returns - The parsed snack limit.
     */
    fromStr(str: string): NotifyConfig['maxSnack'] {
      return snackbarLimitSchema.parse(str);
    },
  },
} as const;
