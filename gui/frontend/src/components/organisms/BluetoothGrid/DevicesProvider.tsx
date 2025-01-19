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
import { PRIVATE_CACHE_OBJ } from '@/lib/storage/cacheKeys';
import { numberSchema } from '@/lib/zod/schema-utils';
import { BluetoothDeviceInfoSchema, type Devices } from '@/services/api/bluetooth_finder';

import { NOTIFY } from '../../../lib/notify';
import { deviceListener } from '../../../services/api/device_listener';

type ContextType = {
  devices: Devices | undefined;
  setDevices: Dispatch<SetStateAction<Devices | undefined>>;
  loading: boolean;
  setLoading: Dispatch<SetStateAction<boolean>>;
};

const Context = createContext<ContextType | undefined>(undefined);

export const OptBluetoothDeviceInfoSchema = z
  .union([z.record(numberSchema, BluetoothDeviceInfoSchema), z.undefined()])
  .catch(undefined);

let unlisten: (() => void) | undefined;

type Props = { children: ReactNode };
export const DevicesProvider: FC<Props> = ({ children }) => {
  const [devices, setDevices] = useStorageState(PRIVATE_CACHE_OBJ.devices, OptBluetoothDeviceInfoSchema);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    NOTIFY.asyncTry(async () => {
      unlisten = await deviceListener({
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
      if (unlisten) {
        unlisten();
      }
    };
  }, [setDevices]);

  return <Context.Provider value={{ devices, setDevices, loading, setLoading }}>{children}</Context.Provider>;
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
