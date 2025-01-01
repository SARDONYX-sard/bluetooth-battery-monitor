import { Box, Button } from '@mui/material';

import type { ComponentPropsWithoutRef } from 'react';

type Props = {
  version: string;
} & ComponentPropsWithoutRef<typeof Button>;
export const Help = ({ version, ...props }: Props) => {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'column',
        height: '100%',
        justifyContent: 'space-evenly',
      }}
    >
      <div>Version: {version}</div>
      <div>
        Source:{' '}
        <Button sx={{ fontSize: 'large' }} type='button' variant='text' {...props}>
          GitHub
        </Button>
      </div>
    </Box>
  );
};
