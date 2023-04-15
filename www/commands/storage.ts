import { invoke } from "@tauri-apps/api";

type StorageData<T> = {
  data: T;
  status: boolean;
};

/**
 * @export
 * @param {string} key
 * @param {*} value
 */
export async function write_data<T>(key: string, value: T) {
  await invoke("write_data", { key, value });
}

/**
 * @param key
 */
export async function read_data<T>(key: string) {
  let res;
  try {
    res = (await invoke("read_data", { key })) as StorageData<T>;
    return res.data;
  } catch (err) {
    console.error(err);
    console.error(res);
  }
}
