import { FormControl, InputLabel, MenuItem, Select, type SelectChangeEvent, Tooltip } from '@mui/material';
import { useCallback, useState } from 'react';

import { type LogLevel, changeLogLevel } from '@/backend_api';
import { notify } from '@/components/notifications';
import { useTranslation } from '@/hooks';
import { selectLogLevel } from '@/utils/selector';

export const LogLevelList = () => {
  const { t } = useTranslation();
  const [logLevel, setLogLevel] = useState<LogLevel>(selectLogLevel(localStorage.getItem('log_level')));

  const handleChange = useCallback(async (event: SelectChangeEvent<LogLevel>) => {
    localStorage.setItem('log_level', event.target.value);
    try {
      const newLogLevel = selectLogLevel(event.target.value);
      await changeLogLevel(newLogLevel);
      setLogLevel(newLogLevel);
    } catch (err) {
      notify.error(`${err}`);
    }
  }, []);

  return (
    <Tooltip
      placement='right'
      title={
        <>
          <p>{t('log-level-list-tooltip')}</p>
          <p>{t('log-level-list-tooltip2')}</p>
          <p>{t('log-level-list-tooltip3')}</p>
          <p>{t('log-level-list-tooltip4')}</p>
        </>
      }
    >
      <FormControl sx={{ m: 1, minWidth: 110 }} variant='filled'>
        <InputLabel id='log-level-select-label'>{t('log-level-list-label')}</InputLabel>
        <Select
          MenuProps={{ disableScrollLock: true }}
          id='log-level-select'
          label='log level'
          labelId='log-level-select-label'
          onChange={handleChange}
          value={logLevel}
        >
          <MenuItem value={'trace'}>Trace</MenuItem>
          <MenuItem value={'debug'}>Debug</MenuItem>
          <MenuItem value={'info'}>Info</MenuItem>
          <MenuItem value={'warn'}>Warning</MenuItem>
          <MenuItem value={'error'}>Error</MenuItem>
        </Select>
      </FormControl>
    </Tooltip>
  );
};
