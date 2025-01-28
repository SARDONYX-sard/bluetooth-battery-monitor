import {
  type Dispatch,
  type FC,
  type ReactNode,
  type SetStateAction,
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';
import { z } from 'zod';

import { useStorageState } from '@/components/hooks/useStorageState';
import { NOTIFY } from '@/lib/notify';
import { PRIVATE_CACHE_OBJ } from '@/lib/storage/cacheKeys';
import { numberSchema } from '@/lib/zod/schema-utils';
import { CONFIG, type Config } from '@/services/api/bluetooth_config';
import { BluetoothDeviceInfoSchema, type Devices } from '@/services/api/bluetooth_finder';
import { deviceListener, devicesListener } from '@/services/api/device_listener';

type ContextType = {
  devices: Devices | undefined;
  setDevices: Dispatch<SetStateAction<Devices | undefined>>;
  loading: boolean;
  setLoading: Dispatch<SetStateAction<boolean>>;

  config: Config | undefined;
  setConfig: Dispatch<SetStateAction<Config | undefined>>;
};

const Context = createContext<ContextType | undefined>(undefined);

export const OptBluetoothDeviceInfoSchema = z
  .union([z.record(numberSchema, BluetoothDeviceInfoSchema), z.undefined()])
  .catch(undefined);

let unlistenUpdate: (() => void) | undefined;
let unlistenRestart: (() => void) | undefined;

type Props = { children: ReactNode };
export const DevicesProvider: FC<Props> = ({ children }) => {
  const [devices, setDevices] = useStorageState(PRIVATE_CACHE_OBJ.devices, OptBluetoothDeviceInfoSchema);
  const [loading, setLoading] = useState<boolean>(false);
  const [config, setConfig] = useState<Config | undefined>(undefined);

  // Update a device information
  useEffect(() => {
    NOTIFY.asyncTry(async () => {
      unlistenUpdate = await deviceListener({
        setDev: (newDevice) => {
          setDevices((prev) => {
            if (prev) {
              prev[newDevice.address] = newDevice;
            }
            return { ...prev };
          });
        },
      });
    });

    return () => {
      if (unlistenUpdate) {
        unlistenUpdate();
      }
    };
  }, [setDevices]);

  // Restart(Replace all devices)
  useEffect(() => {
    NOTIFY.asyncTry(async () => {
      unlistenRestart = await devicesListener({
        setDev: (newDevices) => {
          setDevices(newDevices);
        },
      });
    });

    return () => {
      if (unlistenRestart) {
        unlistenRestart();
      }
    };
  }, [setDevices]);

  // Config
  useEffect(() => {
    NOTIFY.asyncTry(async () => {
      setConfig(await CONFIG.read());
    });
  }, []);

  return (
    <Context.Provider value={{ devices, setDevices, loading, setLoading, config, setConfig }}>
      {children}
    </Context.Provider>
  );
};

/**
 * @throws `useDevicesContext must be used within a DevicesProvider`
 */
export const useDevicesContext = () => {
  const context = useContext(Context);
  if (!context) {
    throw new Error('useDevicesContext must be used within a DevicesProvider');
  }
  return context;
};
