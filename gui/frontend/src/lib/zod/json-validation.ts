import { z } from 'zod';

const literalSchema = z.union([z.string(), z.number(), z.boolean(), z.null()]);
type Literal = z.infer<typeof literalSchema>;
type Json = Literal | { [key: string]: Json } | Json[];
const jsonSchema: z.ZodType<Json> = z.lazy(() => z.union([literalSchema, z.array(jsonSchema), z.record(jsonSchema)]));

/**
 * A utility function that returns a Zod schema which:
 * - Parses a JSON string.
 * - Validates the parsed object using the provided schema `T`.
 *
 * @param schema - The Zod schema to validate the parsed object.
 * @returns A Zod schema that parses JSON and validates the result.
 *
 * @see [Parsing a JSON string with zod](https://github.com/colinhacks/zod/discussions/2215#discussion-4977685)
 *
 * @example
 *
 * ```ts
 * const EditorModeSchema = z.enum(['default', 'vim']);
 * const result = stringToJsonSchema.pipe(EditorModeSchema).safeParse("default");
 * if (result.success) {
 *   return result.data;
 * }
 * ```
 */
export const stringToJsonSchema = z.string().transform((str, ctx): z.infer<typeof jsonSchema> => {
  try {
    return JSON.parse(str);
  } catch (e) {
    ctx.addIssue({ code: 'custom', message: `${e}` });
    return z.NEVER;
  }
});
