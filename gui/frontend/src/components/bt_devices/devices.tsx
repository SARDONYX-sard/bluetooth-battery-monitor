'use client';

import { Box, Grid, List } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';

import { type BluetoothDeviceInfo, FindBluetoothDevices, btCache, changeLogLevel } from '@/backend_api';
import { DeviceCard } from '@/components/bt_devices/device';
import { LogDirButton, LogFileButton, UpdateButton } from '@/components/buttons';
import { notify } from '@/components/notifications';
import { selectLogLevel } from '@/utils/selector';

import { ConfigFields } from './update_interval';

export const DeviceCards = () => {
  const [dev, setDev] = useState<BluetoothDeviceInfo[] | null>(null);

  useEffect(() => {
    (async () => {
      await changeLogLevel(selectLogLevel(localStorage.getItem('log_level')));
      try {
        setDev(await btCache.read());
      } catch (err) {
        notify.error(`${err}`);
      }
    })();
  }, []);

  const updateHandler = useCallback(async () => {
    try {
      const devices = await FindBluetoothDevices();
      setDev(devices);
      await btCache.write(devices);
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
          <UpdateButton eventFn={updateHandler} />
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
