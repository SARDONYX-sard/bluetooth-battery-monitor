'use client';

import { Box, Grid2 as Grid, List } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';

import { LogDirButton } from '@/components/molecules/LogDirButton';
import { LogFileButton } from '@/components/molecules/LogFileButton';
import { ConfigFields } from '@/components/organisms/BluetoothGrid/config';
import { DeviceCard } from '@/components/organisms/BluetoothGrid/device';
import { useLogLevelContext } from '@/components/providers/LogLevelProvider';
import { NOTIFY } from '@/lib/notify';
import { type BluetoothDeviceInfo, restartInterval } from '@/services/api/bluetooth_finder';
import { deviceListener } from '@/services/api/device_listener';
import { LOG } from '@/services/api/log';
import { defaultTrayIcon } from '@/services/api/sys_tray';

import { RestartButton } from './RestartButton';

const getDevFromCache = (): BluetoothDeviceInfo[] | undefined => {
  try {
    const devJson = localStorage.getItem('devices') ?? undefined;
    if (typeof devJson === 'string') {
      return JSON.parse(devJson) as BluetoothDeviceInfo[];
    }
    return devJson;
  } catch (err) {
    NOTIFY.error(`${err}`);
  }
};

export const DeviceCards = () => {
  const [dev, setDev] = useState<BluetoothDeviceInfo[] | undefined>(getDevFromCache());
  const [loading, setLoading] = useState<boolean>(false);
  const { logLevel } = useLogLevelContext();

  useEffect(() => {
    let unlisten: (() => void) | undefined;
    const setDevWrapper = (dev: BluetoothDeviceInfo[]) => {
      setDev(dev);
      localStorage.setItem('devices', JSON.stringify(dev));
    };

    (async () => {
      await LOG.changeLevel(logLevel);
      try {
        unlisten = await deviceListener({ setDev: setDevWrapper });
      } catch (err) {
        NOTIFY.error(`${err}`);
      }
    })();

    return () => {
      if (unlisten) {
        unlisten();
      }
    };
  }, [logLevel]);

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
