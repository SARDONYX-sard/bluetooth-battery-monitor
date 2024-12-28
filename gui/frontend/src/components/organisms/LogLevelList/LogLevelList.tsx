import { useCallback } from 'react';

import { useTranslation } from '@/components/hooks/useTranslation';
import { SelectWithLabel } from '@/components/molecules/SelectWithLabel';
import { NOTIFY } from '@/lib/notify';
import { LOG } from '@/services/api/log';

import { useLogLevelContext } from '../../providers/LogLevelProvider';

import type { SelectChangeEvent } from '@mui/material';

export const LogLevelList = () => {
  const { logLevel, setLogLevel } = useLogLevelContext();

  const handleOnChange = useCallback(
    async ({ target }: SelectChangeEvent) => {
      const newLogLevel = LOG.normalize(target.value);
      setLogLevel(newLogLevel);
      await NOTIFY.asyncTry(async () => await LOG.changeLevel(newLogLevel));
    },
    [setLogLevel],
  );

  const menuItems = [
    { value: 'trace', label: 'Trace' },
    { value: 'debug', label: 'Debug' },
    { value: 'info', label: 'Info' },
    { value: 'warn', label: 'Warning' },
    { value: 'error', label: 'Error' },
  ] as const;

  return (
    <SelectWithLabel
      label={useTranslation().t('log-level-list-label')}
      menuItems={menuItems}
      onChange={handleOnChange}
      value={logLevel}
    />
  );
};
