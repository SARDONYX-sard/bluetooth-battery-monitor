import { Box, type SxProps, type Theme } from '@mui/material';

import { LogDirButton } from '@/components/molecules/LogDirButton';
import { LogFileButton } from '@/components/molecules/LogFileButton';
import { RestartButton } from '@/components/organisms/BluetoothGrid/RestartButton';
import { LogLevelList } from '@/components/organisms/LogLevelList';
import { MonitorConfigButton } from '@/components/organisms/MonitorConfig/MonitorConfigButton';

const sx: SxProps<Theme> = {
  position: 'fixed',
  bottom: 50,
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  padding: '10px',
  justifyContent: 'space-between',
  backgroundColor: '#252525d8',
};

const MenuPadding = () => <div style={{ height: '100px' }} />;

export const FixedNav = () => {
  return (
    <>
      <MenuPadding />
      <Box sx={sx}>
        <LogLevelList />
        <LogDirButton />
        <LogFileButton />
        <RestartButton />
        <MonitorConfigButton />
      </Box>
    </>
  );
};
