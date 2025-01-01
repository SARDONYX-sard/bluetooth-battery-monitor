'use client';

import { Box, Grid2 as Grid, List } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import { z } from 'zod';

import { useStorageState } from '@/components/hooks/useStorageState';
import { LogDirButton } from '@/components/molecules/LogDirButton';
import { LogFileButton } from '@/components/molecules/LogFileButton';
import { ConfigFields } from '@/components/organisms/BluetoothGrid/config';
import { DeviceCard } from '@/components/organisms/BluetoothGrid/device';
import { useLogLevelContext } from '@/components/providers/LogLevelProvider';
import { NOTIFY } from '@/lib/notify';
import { PRIVATE_CACHE_OBJ } from '@/lib/storage/cacheKeys';
import { type BluetoothDeviceInfo, BluetoothDeviceInfoSchema, restartInterval } from '@/services/api/bluetooth_finder';
import { deviceListener } from '@/services/api/device_listener';
import { LOG } from '@/services/api/log';
import { defaultTrayIcon } from '@/services/api/sys_tray';

import { RestartButton } from './RestartButton';

const OptBluetoothDeviceInfoSchema = z.union([z.array(BluetoothDeviceInfoSchema), z.undefined()]).catch(undefined);

export const DeviceCards = () => {
  const [dev, setDev] = useStorageState(PRIVATE_CACHE_OBJ.devices, OptBluetoothDeviceInfoSchema);
  const [loading, setLoading] = useState<boolean>(false);
  const { logLevel } = useLogLevelContext();

  useEffect(() => {
    (async () => {
      await LOG.changeLevel(logLevel);
    })();
  }, [logLevel]);

  useEffect(() => {
    let unlisten: (() => void) | undefined;
    NOTIFY.asyncTry(async () => {
      unlisten = await deviceListener({ setDev });
    });
    return () => {
      if (unlisten) {
        unlisten();
      }
    };
  }, [setDev]);

  const restartHandler = useCallback(async () => {
    let unlisten: (() => void) | undefined;

    try {
      setLoading(true);
      await defaultTrayIcon();
      await restartInterval();
      unlisten = await deviceListener({
        setDev: (_dev: BluetoothDeviceInfo[]) => {
          setLoading(false);
          if (unlisten) {
            unlisten();
          }
        },
      });
    } catch (err) {
      NOTIFY.error(`${err}`);
    }
  }, []);

  return (
    <Box
      sx={{
        display: 'grid',
        placeItems: 'center',
        paddingTop: '15px',
        minHeight: '100%',
        width: '90%',
      }}
    >
      <Grid container={true} sx={{ display: 'flex', justifyContent: 'space-evenly', width: '100%' }}>
        <Grid>
          <LogFileButton />
        </Grid>
        <Grid>
          <LogDirButton />
        </Grid>

        <Grid>
          <RestartButton loading={loading} onClick={restartHandler} />
        </Grid>
        <Grid>
          <ConfigFields />
        </Grid>
      </Grid>

      <List>
        {dev?.map((dev) => {
          return <DeviceCard device={dev} key={dev.instance_id} />;
        })}
      </List>
    </Box>
  );
};
