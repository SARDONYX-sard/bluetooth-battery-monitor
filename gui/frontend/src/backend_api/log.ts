import { invoke } from '@tauri-apps/api';
import { appLogDir } from '@tauri-apps/api/path';
import { open as openShell } from '@tauri-apps/api/shell';

import tauriJson from '../../../backend/tauri.conf.json';

export type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error';
/**
 * Invokes the `change_log_level` command with the specified log level.
 * @param {LogLevel} [logLevel] - The log level to set. If not provided, the default log level will be used.
 * @returns {Promise<void>} A promise that resolves when the log level is changed.
 */
export async function changeLogLevel(logLevel?: LogLevel): Promise<void> {
  await invoke('change_log_level', { logLevel });
}

/**
 * Opens the log file.
 * @throws - if not found path
 */
export async function openLogFile() {
  const logFile = `${await appLogDir()}/${tauriJson.package.productName}.log`;
  await openShell(logFile);
}

/**
 * Opens the log directory.
 * @throws - if not found path
 */
export async function openLogDir() {
  await openShell(await appLogDir());
}
