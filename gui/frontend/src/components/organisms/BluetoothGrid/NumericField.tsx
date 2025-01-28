import { Skeleton, TextField, Tooltip } from '@mui/material';

import { useTranslation } from '@/components/hooks/useTranslation';
import type { I18nKeys } from '@/lib/i18n';

import type { ChangeEventHandler } from 'react';

type NumericFieldProps = {
  label: I18nKeys;
  value: number | undefined;
  errorCondition: boolean;
  errorMessage: string;
  onChange: ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  tooltipKey: I18nKeys;
  minValue: number;
};

export const NumericField = ({
  label,
  value,
  errorCondition,
  errorMessage,
  onChange,
  tooltipKey,
  minValue,
}: NumericFieldProps) => {
  const { t } = useTranslation();

  return value !== undefined ? (
    <Tooltip arrow={true} placement='top' title={t(tooltipKey)}>
      <TextField
        error={errorCondition}
        helperText={errorCondition ? errorMessage : ''}
        id='outlined-number'
        label={t(label)}
        onChange={onChange}
        slotProps={{
          inputLabel: {
            shrink: true,
          },
          input: {
            inputProps: {
              min: minValue,
            },
          },
        }}
        sx={{ m: 1, minWidth: 105, width: 105 }}
        type='number'
        value={value}
      />
    </Tooltip>
  ) : (
    <Skeleton height={10} width={105} />
  );
};
