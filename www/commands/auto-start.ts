// Copyright 2019-2021 Tauri Programme within The Commons Conservancy
// SPDX-License-Identifier: Apache-2.0
// SPDX-License-Identifier: MIT

import { invoke } from "@tauri-apps/api";

export async function isEnabled(): Promise<boolean> {
  return await invoke("plugin:autostart|is_enabled");
}

export async function enable(): Promise<void> {
  try {
    await invoke("plugin:autostart|enable");
  } catch (error) {
    console.error(error);
  }
}

export async function disable(): Promise<void> {
  try {
    await invoke("plugin:autostart|disable");
  } catch (error) {
    console.error(error);
  }
}
