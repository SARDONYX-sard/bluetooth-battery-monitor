import { enqueueSnackbar } from 'notistack';

import type { OptionsObject, SnackbarMessage } from 'notistack';

/**
 * Wrapper to simplify refactoring of libraries such as snackbar and toast
 */
export const NOTIFY = {
  /** Show as `info` message. */
  info(message: SnackbarMessage, options?: OptionsObject<'info'>) {
    return enqueueSnackbar(message, { variant: 'info', ...options });
  },
  /** Show as `success` message. */
  success(message: SnackbarMessage, options?: OptionsObject<'success'>) {
    return enqueueSnackbar(message, { variant: 'success', ...options });
  },
  /** Show as `warning` message. */
  warn(message: SnackbarMessage, options?: OptionsObject<'warning'>) {
    return enqueueSnackbar(message, { variant: 'warning', ...options });
  },
  /** Show as `error` message. */
  error(message: SnackbarMessage, options?: OptionsObject<'error'>) {
    return enqueueSnackbar(message, { variant: 'error', ...options });
  },

  /** Try to execute function, and then catch & notify if error. */
  try<Fn extends () => ReturnType<Fn>>(tryFn: Fn): ReturnType<Fn> | undefined {
    try {
      return tryFn();
    } catch (error) {
      NOTIFY.error(`${error}`);
    }
  },

  /** Try to execute async function, and then catch & notify if error. */
  async asyncTry<Fn extends () => ReturnType<Fn>>(tryFn: Fn): Promise<ReturnType<Fn> | undefined> {
    try {
      return await tryFn();
    } catch (error) {
      NOTIFY.error(`${error}`);
    }
  },
} as const;
