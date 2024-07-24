'use client';

import { Box, Skeleton } from '@mui/material';
import { Suspense } from 'react';

import { DeviceCards } from '@/components/bt_devices';
import { useDynStyle, useInjectScript, useLocale } from '@/hooks';

export default function Home() {
  useDynStyle();
  useInjectScript();
  useLocale();

  return (
    <Box
      component='main'
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        minHeight: 'calc(100vh - 56px)',
        width: '100%',
      }}
    >
      <Suspense fallback={<Skeleton height={'70vh'} width={'90%'} />}>
        <DeviceCards />
      </Suspense>
    </Box>
  );
}
