import { listen } from '@tauri-apps/api/event';

import { NOTIFY } from '@/lib/notify';
import type { Devices } from '@/services/api/bluetooth_finder';

import type { EventCallback } from '@tauri-apps/api/event';
import type { JSX } from 'react/jsx-runtime';

type ListenerProps = {
  setDev: (devices: Devices) => void;
  /** @default Error */
  error?: string | JSX.Element;
};

export async function deviceListener({ setDev, error }: ListenerProps) {
  let unlisten: (() => void) | null = null;
  const eventHandler: EventCallback<Devices | undefined> = (event) => {
    if (event.payload) {
      setDev(event.payload);
    }
  };

  try {
    // Setup before run Promise(For event hook)
    unlisten = await listen<Devices>('bt_monitor://update_devices', eventHandler);
    return unlisten;
  } catch (err) {
    NOTIFY.error(error ?? `${err}`);
    if (unlisten) {
      unlisten();
    }
  }
}
