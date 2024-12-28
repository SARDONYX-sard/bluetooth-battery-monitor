import { Box, Checkbox, FormControlLabel } from '@mui/material';

import { useTranslation } from '@/components/hooks/useTranslation';

import type { MouseEventHandler } from 'react';

type Props = {
  isAllChecked: boolean;
  isPubAllChecked: boolean;
  onAllCheck: MouseEventHandler<HTMLButtonElement>;
  onPubCheck: MouseEventHandler<HTMLButtonElement>;
};

export const CheckBoxControls = ({ isAllChecked, isPubAllChecked, onAllCheck, onPubCheck }: Props) => {
  const { t } = useTranslation();
  return (
    <Box>
      <FormControlLabel
        checked={isAllChecked}
        control={<Checkbox onClick={onAllCheck} />}
        label={t('backup-dialog-all-checked-label')}
      />
      <FormControlLabel
        checked={isPubAllChecked}
        control={<Checkbox onClick={onPubCheck} />}
        label={t('backup-dialog-pub-checked-label')}
      />
    </Box>
  );
};
