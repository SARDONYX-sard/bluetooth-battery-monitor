'use client'; // If this directive is not present on each page, a build error will occur.
import { Box, type SxProps, type Theme } from '@mui/material';
import Grid from '@mui/material/Grid2';

import { Help } from '@/components/atoms/Help';
import { useInjectJs } from '@/components/hooks/useInjectJs';
import { CodeEditorTab } from '@/components/organisms/CodeEditorTab';
import { Tabs } from '@/components/organisms/Tabs';
import { useTabContext } from '@/components/providers/TabProvider';
import { start } from '@/services/api/shell';

import packageJson from '@/../../package.json';

import type { MouseEventHandler } from 'react';

const sx: SxProps<Theme> = {
  alignItems: 'center',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  minHeight: 'calc(100vh - 56px)',
  width: '100%',
};

export const Settings = () => {
  useInjectJs();
  const { tabPos } = useTabContext();

  return (
    <Box component='main' sx={sx}>
      {tabPos === 'top' ? (
        <>
          <TabsMenu />
          <CodeEditorTab />
        </>
      ) : (
        <>
          <CodeEditorTab />
          <TabsMenu />
        </>
      )}
    </Box>
  );
};

const TabsMenu = () => {
  const handleHelpClick: MouseEventHandler<HTMLButtonElement> = (_event) => {
    start(packageJson.homepage); // jump by backend api
  };

  return (
    <Grid container={true} sx={{ width: '95%' }}>
      <Grid size={8} sx={{ overflowX: 'auto' }}>
        <Tabs />
      </Grid>
      <Grid size={4} sx={{ overflowX: 'auto' }}>
        <Help onClick={handleHelpClick} version={packageJson.version} />
      </Grid>
    </Grid>
  );
};
