'use client';

import { Box, Skeleton, Stack } from '@mui/material';
import { useEffect } from 'react';

import { DeviceCard } from '@/components/organisms/BluetoothGrid/DeviceCard';
import { useLogLevelContext } from '@/components/providers/LogLevelProvider';
import { NOTIFY } from '@/lib/notify';
import { OBJECT } from '@/lib/object-utils';
import { getDevices } from '@/services/api/bluetooth_finder';
import { LOG } from '@/services/api/log';

import { useDevicesContext } from './DevicesProvider';

export const DeviceCards = () => {
  const { devices, setDevices, config } = useDevicesContext();
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
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', // Adjusts number of columns based on screen size
        gap: '16px', // Space between cards
        paddingTop: '15px',
        minHeight: '100%',
        width: '90%',
      }}
    >
      {devices ? (
        OBJECT.entries(devices)
          .sort(([_, a], [__, b]) => {
            // sort by is_connected first (true first)
            if (a.is_connected !== b.is_connected) {
              return a.is_connected ? -1 : 1;
            }

            return new Date(b.last_used).getTime() - new Date(a.last_used).getTime(); // sort in ascending order based on last_used
          })
          .map(([address, dev]) => {
            return <DeviceCard device={dev} iconType={config?.icon_type ?? 'circle'} key={address} />;
          })
      ) : (
        <LoadingSkeletons />
      )}
    </Box>
  );
};

const LoadingSkeletons = () => (
  <Stack spacing={2}>
    {Array.from({ length: 5 }).map((_, index) => (
      // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
      <Skeleton height={60} key={index} sx={{ borderRadius: '8px', width: '100%' }} variant='rectangular' />
    ))}
  </Stack>
);
