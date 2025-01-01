import { z } from 'zod';

export const snackbarOriginSchema = z
  .object({
    vertical: z.enum(['top', 'bottom']).catch('top'),
    horizontal: z.enum(['left', 'center', 'right']).catch('left'),
  })
  .catch({
    horizontal: 'left',
    vertical: 'top',
  });

// NOTE: Cannot convert string to number without `coerce: true`.
// https://github.com/colinhacks/zod/discussions/330#discussioncomment-8895651
export const snackbarLimitSchema = z.number({ coerce: true }).int().positive().catch(3);
