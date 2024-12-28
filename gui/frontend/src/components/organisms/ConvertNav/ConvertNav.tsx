import { Box, type SxProps, type Theme } from '@mui/material';

import { ConvertButton } from '@/components/atoms/ConvertButton';
import { LogDirButton } from '@/components/molecules/LogDirButton';
import { LogFileButton } from '@/components/molecules/LogFileButton';
import { LogLevelList } from '@/components/organisms/LogLevelList';

import type { ComponentPropsWithRef } from 'react';

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

type Props = ComponentPropsWithRef<typeof ConvertButton>;

const MenuPadding = () => <div style={{ height: '100px' }} />;
export const ConvertNav = (props: Props) => {
  return (
    <>
      <MenuPadding />
      <Box sx={sx}>
        <LogLevelList />
        <LogDirButton />
        <LogFileButton />
        <ConvertButton {...props} />
      </Box>
    </>
  );
};
