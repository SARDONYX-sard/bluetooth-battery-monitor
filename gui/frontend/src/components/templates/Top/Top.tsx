'use client'; // If this directive is not present on each page, a build error will occur.
import { Box, Skeleton, type SxProps, type Theme } from '@mui/material';
import { Suspense } from 'react';

import { useInjectJs } from '@/components/hooks/useInjectJs';
import { DeviceCards } from '@/components/organisms/BluetoothGrid';
import { DevicesProvider } from '@/components/organisms/BluetoothGrid/DevicesProvider';
import { FixedNav } from '@/components/organisms/FixedNav';

const sx: SxProps<Theme> = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  minHeight: 'calc(100vh - 56px)',
  width: '100%',
};

export const Top = () => {
  useInjectJs();

  return (
    <Box component='main' sx={sx}>
      <DevicesProvider>
        <TopInner />
      </DevicesProvider>
    </Box>
  );
};

const TopInner = () => {
  return (
    <Suspense fallback={<Skeleton height={'70vh'} width={'90%'} />}>
      <DeviceCards />
      <FixedNav />
    </Suspense>
  );
};
