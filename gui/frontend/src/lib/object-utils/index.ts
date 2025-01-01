/**
 * A utility object that provides type-safe methods for working with object properties.(**without casting by `as`**)
 *
 * Forked by: https://zenn.dev/ossamoon/articles/694a601ee62526
 *
 * @remarks
 * The `OBJECT` contains two methods: `keys` and `entries`.
 * Both methods are generic and work with any object type, ensuring type safety by returning
 * appropriate key and value types based on the input object.
 *
 * @example
 * ```typescript
 * const exampleObject = { a: 42, b: "Hello", c: true };
 *
 * // Using keys method
 * const keys = OBJECT.keys(exampleObject);
 * // keys is inferred as ("a" | "b" | "c")[]
 * console.log(keys); // Output: ["a", "b", "c"]
 *
 * // Using entries method
 * const entries = OBJECT.entries(exampleObject);
 * // entries is inferred as ["a" | "b" | "c", number | string | boolean][]
 * console.log(entries);
 * // Output: [["a", 42], ["b", "Hello"], ["c", true]]
 * ```
 *
 * @template T - The type of the input object.
 */
export const OBJECT = {
  /**
   * Returns an array of keys from the given object, inferred as the keys' types.
   *
   * @param obj - The object from which to extract the keys.
   * @returns An array of keys of type (keyof T).
   *
   * @example
   * ```typescript
   * const obj = { x: 1, y: "text", z: false };
   * const keys = OBJECT.keys(obj);
   * console.log(keys); // Output: ["x", "y", "z"]
   * ```
   */
  keys: <T extends { [key: string]: unknown }>(obj: T): (keyof T)[] => {
    return Object.keys(obj);
  },

  values: <T extends { [key: string]: T[keyof T] }>(obj: T): T[keyof T][] => {
    return Object.values(obj);
  },

  /**
   * Returns an array of key-value pairs from the given object, where each pair is a tuple
   * containing a key and its corresponding value.
   *
   * @param obj - The object from which to extract the key-value pairs.
   * @returns An array of tuples of type [keyof T, T[keyof T]].
   *
   * @example
   * ```typescript
   * const obj = { a: 1, b: "string", c: true };
   * const entries = OBJECT.entries(obj);
   * console.log(entries);
   * // Output: [["a", 1], ["b", "string"], ["c", true]]
   * ```
   */
  entries: <T extends { [key: string]: T[keyof T] }>(obj: T): [keyof T, T[keyof T]][] => {
    return Object.entries(obj);
  },
} as const;
