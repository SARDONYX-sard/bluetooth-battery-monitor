import { FormControl, InputLabel, MenuItem, Select, type SelectChangeEvent } from '@mui/material';
import { type ComponentPropsWithRef, type Ref, useId } from 'react';

import type { SxProps, Theme } from '@mui/system';

type MenuItems<V extends string> = {
  label: string;
  value: V;
};

type SelectWithLabelProps<V extends string, T extends MenuItems<V>> = {
  label: string;
  menuItems: readonly T[];
  onChange: (e: SelectChangeEvent<T['value']>) => void;
  sx?: SxProps<Theme>;
  value: T['value'];
  variant?: ComponentPropsWithRef<typeof FormControl>['variant'];
  ref?: Ref<HTMLDivElement>;
};

export const SelectWithLabel = <V extends string, T extends MenuItems<V>>({
  label,
  menuItems,
  onChange,
  sx = { m: 1, minWidth: 110 },
  value,
  variant = 'filled',
  ref,
  ...props // HACK: 2. We need to let props inherit in order for it to work when wrapped in `ToolTip`.
}: SelectWithLabelProps<V, T>) => {
  const id = useId();
  const labelId = `${id}-label`;
  const selectId = `${id}-select`;

  return (
    <FormControl ref={ref} sx={sx} variant={variant} {...props}>
      <InputLabel id={labelId}>{label}</InputLabel>
      <Select MenuProps={{ disableScrollLock: true }} id={selectId} labelId={labelId} onChange={onChange} value={value}>
        {menuItems.map((menuItem) => (
          <MenuItem key={menuItem.value} value={menuItem.value}>
            {menuItem.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
