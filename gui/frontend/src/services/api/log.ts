import { app } from '@tauri-apps/api';
import { invoke } from '@tauri-apps/api/core';
import { appLogDir } from '@tauri-apps/api/path';
import { open } from '@tauri-apps/plugin-shell';
import { z } from 'zod';

import { STORAGE } from '@/lib/storage';
import { PUB_CACHE_OBJ } from '@/lib/storage/cacheKeys';
import { stringToJsonSchema } from '@/lib/zod/json-validation';

const logList = ['trace', 'debug', 'info', 'warn', 'error'] as const;
const DEFAULT = 'error';
const logLevelSchema = z.enum(logList).catch(DEFAULT);
export type LogLevel = z.infer<typeof logLevelSchema>;

/** @default `error` */
const normalize = (logLevel?: string | null): LogLevel => {
  return logLevelSchema.parse(logLevel);
};

export const LOG = {
  default: DEFAULT,

  /**
   * Opens the log file.
   * @throws - if not found path
   */
  async openFile() {
    const logFile = `${await appLogDir()}/${await app.getName()}.log`;
    await open(logFile);
  },

  /**
   * Opens the log directory.
   * @throws - if not found path
   */
  async openDir() {
    await open(await appLogDir());
  },

  /**
   * Invokes the `change_log_level` command with the specified log level.
   * @param logLevel - The log level to set. If not provided, the default log level will be used.
   * @returns A promise that resolves when the log level is changed.
   */
  async changeLevel(logLevel?: LogLevel) {
    await invoke('change_log_level', { logLevel });
  },

  normalize,

  /** get current log level from `LocalStorage`. */
  get() {
    return stringToJsonSchema.catch('error').pipe(logLevelSchema).parse(STORAGE.get(PUB_CACHE_OBJ.logLevel));
  },

  /** set log level to `LocalStorage`. */
  set(level: LogLevel) {
    STORAGE.set(PUB_CACHE_OBJ.logLevel, JSON.stringify(level));
  },
} as const;
