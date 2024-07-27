'use client';

import { Box, Grid, List } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';

import {
  type BluetoothDeviceInfo,
  changeLogLevel,
  defaultTrayIcon,
  deviceListener,
  restartInterval,
} from '@/backend_api';
import { ConfigFields } from '@/components/bt_devices/config';
import { DeviceCard } from '@/components/bt_devices/device';
import { LogDirButton, LogFileButton, RestartButton } from '@/components/buttons';
import { notify } from '@/components/notifications';
import { selectLogLevel } from '@/utils/selector';

const getDevFromCache = (): BluetoothDeviceInfo[] | undefined => {
  try {
    const devJson = localStorage.getItem('devices') ?? undefined;
    if (typeof devJson === 'string') {
      return JSON.parse(devJson) as BluetoothDeviceInfo[];
    }
    return devJson;
  } catch (err) {
    notify.error(`${err}`);
  }
};

export const DeviceCards = () => {
  const [dev, setDev] = useState<BluetoothDeviceInfo[] | undefined>(getDevFromCache());
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    let unlisten: (() => void) | undefined = undefined;
    const setDevWrapper = (dev: BluetoothDeviceInfo[]) => {
      setDev(dev);
      localStorage.setItem('devices', JSON.stringify(dev));
    };

    (async () => {
      await changeLogLevel(selectLogLevel(localStorage.getItem('log_level')));
      try {
        unlisten = await deviceListener({ setDev: setDevWrapper });
      } catch (err) {
        notify.error(`${err}`);
      }
    })();

    return () => {
      if (unlisten) {
        unlisten();
      }
    };
  }, []);

  const restartHandler = useCallback(async () => {
    let unlisten: (() => void) | undefined = undefined;

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
      notify.error(`${err}`);
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
      <Grid container sx={{ display: 'flex', justifyContent: 'space-evenly', width: '100%' }}>
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
