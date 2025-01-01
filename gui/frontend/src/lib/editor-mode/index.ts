import { z } from 'zod';

import { NOTIFY } from '@/lib/notify';

const DEFAULT: EditorMode = 'default';

/** Zod schema for validating the editor mode value. */
export const editorModeSchema = z.enum(['default', 'vim']);
/** Automatically inferred `EditorMode` type from the schema. */
export type EditorMode = z.infer<typeof editorModeSchema>;

/**
 * Normalizes the editor mode value.
 * If the provided mode is invalid, it falls back to the default mode.
 *
 * @param mode - The editor mode value
 * @returns A valid `EditorMode`. Defaults to `'default'` if invalid.
 */
const normalize = (mode: string): EditorMode => {
  const result = editorModeSchema.safeParse(mode);
  if (result.success) {
    return result.data;
  }

  const errMsg = result.error.errors.map((error) => error.message).join(', ');
  NOTIFY.error(`Invalid editor mode: ${errMsg}`);
  return DEFAULT;
};

export const EDITOR_MODE = {
  /** The default editor mode. */
  default: DEFAULT,
  schema: editorModeSchema,

  /**
   * Fallback to `'default'` if the value is `null` or `undefined`.
   *
   * @param mode - The editor mode value to normalize.
   * @returns A valid `EditorMode`.
   */
  normalize,
};
