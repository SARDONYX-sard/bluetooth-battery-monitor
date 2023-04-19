import { invoke } from "@tauri-apps/api";

type StorageData<T> = {
  data: T;
  status: boolean;
};

/**
 *
 * @export
 * @param {string} key
 * @param {*} value
 */
export async function write_data<T>(key: string, value: T) {
  try {
    await invoke("write_data", { key, value });
  } catch (err) {
    console.error(err);
  }
}

/**
 * @param {string} key - key to store
 *
 * - NOTE:
 *  JSON.parse() is not necessary and can be used as an object immediately by casting with as.
 */
export async function read_data<T>(key: string) {
  let res: StorageData<T>;
  try {
    res = await invoke("read_data", { key });
    return res.data;
  } catch (err) {
    console.error(err);
  }
}

/**
 * @param {string} key - key to store
 *
 * - NOTE:
 *  JSON.parse() is not necessary and can be used as an object immediately by casting with as.
 */
export async function delete_storage_data<T>(key: string) {
  let res: StorageData<T>;
  try {
    res = await invoke("delete_storage_data", { key });
    return res.data;
  } catch (err) {
    console.error(err);
  }
}
