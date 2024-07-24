import { FormControl, InputLabel, TextField } from '@mui/material';
import MenuItem from '@mui/material/MenuItem';
import Select, { type SelectChangeEvent } from '@mui/material/Select';
import { type ChangeEventHandler, useCallback, useState } from 'react';

import { getSnackbarSettings } from '@/components/notifications';
import { useTranslation } from '@/hooks';
import { localStorageManager } from '@/utils/local_storage_manager';

import { LogLevelList } from './log_level_list';

import type { SnackbarOrigin } from 'notistack';

export const NoticeSettingsList = () => {
  const { t } = useTranslation();
  // NOTE: Get settings here at once to avoid cache access.
  const { position, maxSnack: initMaxSnack } = getSnackbarSettings();
  const [pos, setPos] = useState(position);
  const [maxSnack, setMaxSnack] = useState(initMaxSnack);

  const handlePosChange = useCallback((e: SelectChangeEvent<string>) => {
    const [vertical, horizontal] = e.target.value.split('_');

    const newPosition: SnackbarOrigin = {
      vertical: vertical === 'bottom' || vertical === 'top' ? vertical : 'bottom',
      horizontal: horizontal === 'center' || horizontal === 'right' || horizontal === 'left' ? horizontal : 'right',
    };

    localStorageManager.set(
      'snackbar-position',
      JSON.stringify({
        vertical: vertical,
        horizontal: horizontal,
      }),
    );
    setPos(newPosition);
  }, []);

  const handleMaxSnackChange: ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement> = (e) => {
    const newValue = Number(e.target.value);
    const newMaxSnack = Number.isNaN(newValue) ? 3 : newValue;
    if (Number.isNaN(newValue)) {
      localStorageManager.set('snackbar-limit', '1');
    } else {
      localStorageManager.set('snackbar-limit', `${newMaxSnack}`);
    }
    setMaxSnack(newMaxSnack);
  };

  return (
    <>
      <FormControl sx={{ m: 1, minWidth: 105 }} variant='filled'>
        <InputLabel id='notice-position-label'>{t('notice-position-list-label')}</InputLabel>
        <Select
          MenuProps={{ disableScrollLock: true }}
          id='notice-position'
          label='Editor Mode'
          labelId='notice-position-label'
          onChange={handlePosChange}
          value={`${pos.vertical}_${pos.horizontal}`}
        >
          <MenuItem value={'top_right'}>{t('notice-position-top-right')}</MenuItem>
          <MenuItem value={'top_center'}>{t('notice-position-top-center')}</MenuItem>
          <MenuItem value={'top_left'}>{t('notice-position-top-left')}</MenuItem>
          <MenuItem value={'bottom_right'}>{t('notice-position-bottom-right')}</MenuItem>
          <MenuItem value={'bottom_center'}>{t('notice-position-bottom-center')}</MenuItem>
          <MenuItem value={'bottom_left'}>{t('notice-position-bottom-left')}</MenuItem>
        </Select>
      </FormControl>
      <TextField
        InputLabelProps={{ shrink: true }}
        InputProps={{ inputProps: { min: 1 } }}
        error={maxSnack < 1}
        helperText={maxSnack < 1 ? 'Min. 1' : ''}
        id='outlined-number'
        label={t('notice-limit')}
        onChange={handleMaxSnackChange}
        sx={{ m: 1, minWidth: 105, width: 105 }}
        type='number'
        value={maxSnack}
      />
      <LogLevelList />
    </>
  );
};
