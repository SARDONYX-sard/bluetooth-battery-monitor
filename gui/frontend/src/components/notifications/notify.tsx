import { enqueueSnackbar } from 'notistack';

import { localStorageManager } from '@/utils/local_storage_manager';

import type { OptionsObject, SnackbarMessage, SnackbarOrigin } from 'notistack';

// Notify design is defined in provider
/**
 * Wrapper to simplify refactoring of libraries such as snackbar and toast
 */
export const notify = {
  info(message: SnackbarMessage, options?: OptionsObject<'info'>) {
    enqueueSnackbar(message, { variant: 'info', ...options });
  },
  success(message: SnackbarMessage, options?: OptionsObject<'success'>) {
    enqueueSnackbar(message, { variant: 'success', ...options });
  },
  warn(message: SnackbarMessage, options?: OptionsObject<'warning'>) {
    enqueueSnackbar(message, { variant: 'warning', ...options });
  },
  error(message: SnackbarMessage, options?: OptionsObject<'error'>) {
    enqueueSnackbar(message, { variant: 'error', ...options });
  },
};

type SnackbarSettings = {
  position: SnackbarOrigin;
  maxSnack: number;
};

export const defaultSnackbarSettings: SnackbarSettings = {
  position: {
    horizontal: 'right',
    vertical: 'bottom',
  },
  maxSnack: 3,
} as const;

export const getSnackbarSettings = (): SnackbarSettings => {
  let position: Partial<SnackbarOrigin> = {};
  try {
    position = JSON.parse(localStorageManager.get('snackbar-position') ?? '{}');
  } catch (error) {
    console.error(error);
  }

  const maxSnack = Number(localStorageManager.get('snackbar-limit'));
  const { position: defaultPos, maxSnack: defaultMaxSnack } = defaultSnackbarSettings;

  return {
    position: {
      horizontal: position?.horizontal ?? defaultPos.horizontal,
      vertical: position?.vertical ?? defaultPos.vertical,
    },
    maxSnack: Number.isNaN(maxSnack) ? defaultMaxSnack : maxSnack,
  };
};
