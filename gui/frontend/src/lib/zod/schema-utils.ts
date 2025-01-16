import { z } from 'zod';

export const boolSchema = z.boolean().catch(false);
export const stringArraySchema = z.array(z.string()).catch([]);
export const stringSchema = z.string().catch('');
export const numberSchema = z.number().catch(0);

/**
 * @see
 * [Enum From Object Literal Keys](https://github.com/colinhacks/zod/discussions/839)
 */
export const enumFromKeys = <
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  Rec extends Record<string, any>,
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  K extends string = Rec extends Record<infer R, any> ? R : never,
>(
  input: Rec,
): z.ZodEnum<[K, ...K[]]> => {
  const [firstKey, ...otherKeys] = Object.keys(input) as [K, ...K[]];
  return z.enum([firstKey, ...otherKeys]);
};
