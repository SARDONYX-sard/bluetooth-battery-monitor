import type { LogLevel } from '@/backend_api';

export type EditorMode = 'default' | 'vim';
/** 'default' if null or undefined */
export function selectEditorMode(select?: string | null): EditorMode {
  if (select === 'vim') {
    return select;
  }
  return 'default';
}

/** 'error' if null or undefined */
export function selectLogLevel(logLevel?: string | null): LogLevel {
  switch (logLevel) {
    case 'trace':
    case 'debug':
    case 'info':
    case 'warn':
    case 'error':
      return logLevel;
    default:
      return 'error';
  }
}
