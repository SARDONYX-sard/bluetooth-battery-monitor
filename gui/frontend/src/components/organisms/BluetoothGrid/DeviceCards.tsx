'use client';

import { Box, List } from '@mui/material';
import { useEffect } from 'react';

import { DeviceCard } from '@/components/organisms/BluetoothGrid/DeviceCard';
import { useLogLevelContext } from '@/components/providers/LogLevelProvider';
import { NOTIFY } from '@/lib/notify';
import { OBJECT } from '@/lib/object-utils';
import { getDevices } from '@/services/api/bluetooth_finder';
import { LOG } from '@/services/api/log';

import { useDevicesContext } from './DevicesProvider';

export const DeviceCards = () => {
  const { devices, setDevices } = useDevicesContext();
  const { logLevel } = useLogLevelContext();

  useEffect(() => {
    (async () => {
      await LOG.changeLevel(logLevel);
    })();
  }, [logLevel]);

  useEffect(() => {
    NOTIFY.asyncTry(async () => {
      setDevices(await getDevices());
    });
  }, [setDevices]);

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
      <List>
        {devices
          ? OBJECT.entries(devices).map(([address, dev]) => {
              return <DeviceCard device={dev} key={address} />;
            })
          : null}
      </List>
    </Box>
  );
};
