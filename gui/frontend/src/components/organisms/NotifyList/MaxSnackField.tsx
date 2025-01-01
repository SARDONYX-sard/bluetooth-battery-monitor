import { TextField } from '@mui/material';

import type { ComponentPropsWithRef } from 'react';

type Props = {
  value: number;
} & ComponentPropsWithRef<typeof TextField>;

export const MaxSnackField = ({ value, ...props }: Props) => {
  const slotProps: Props['slotProps'] = {
    input: { inputProps: { min: 1 } },
    inputLabel: { shrink: true },
  };

  return (
    <TextField
      error={value < 1}
      helperText={value < 1 ? 'Min. 1' : ''}
      id='outlined-number'
      slotProps={slotProps}
      sx={{ m: 1, minWidth: 105, width: 105 }}
      type='number'
      value={value}
      {...props}
    />
  );
};
