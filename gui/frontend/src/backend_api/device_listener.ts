import { listen } from '@tauri-apps/api/event';

import type { BluetoothDeviceInfo } from '@/backend_api';
import { notify } from '@/components/notifications';

import type { EventCallback } from '@tauri-apps/api/event';
import type { JSX } from 'react/jsx-runtime';

type ListenerProps = {
  setDev: (devices: BluetoothDeviceInfo[]) => void;
  /** @default Error */
  error?: string | JSX.Element;
};

export async function deviceListener({ setDev, error }: ListenerProps) {
  let unlisten: (() => void) | null = null;
  const eventHandler: EventCallback<BluetoothDeviceInfo[]> = (event) => {
    setDev(event.payload);
  };

  try {
    // Setup before run Promise(For event hook)
    unlisten = await listen<BluetoothDeviceInfo[]>('bt_monitor://restart_interval', eventHandler);
    return unlisten;
  } catch (err) {
    notify.error(error ?? `${err}`);
    if (unlisten) {
      unlisten();
    }
  }
}
