'use client';
import { Checkbox, FormControlLabel, Tooltip } from '@mui/material';

import { useStorageState, useTranslation } from '@/hooks';

import type { FormControlLabelProps } from '@mui/material';

export const ExecJsBtn = ({ ...props }: Omit<FormControlLabelProps, 'control' | 'label'>) => {
  const { t } = useTranslation();
  const [runScript, setRunScript] = useStorageState('runScript', 'false');

  return (
    <Tooltip
      title={
        <>
          {t('custom-js-auto-run-tooltip')}
          <br />
          {t('custom-js-auto-run-tooltip2')}
        </>
      }
    >
      <FormControlLabel
        {...props}
        control={
          <Checkbox
            checked={runScript === 'true'}
            onClick={() => {
              const newValue = runScript === 'true' ? 'false' : 'true';
              if (newValue === 'false') {
                window.location.reload();
              }
              setRunScript(newValue);
            }}
          />
        }
        label={t('custom-js-auto-run-label')}
      />
    </Tooltip>
  );
};
