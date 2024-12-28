import SyncIcon from '@mui/icons-material/Sync';
import LoadingButton from '@mui/lab/LoadingButton';
import { Tooltip } from '@mui/material';

import { useTranslation } from '@/components/hooks/useTranslation';

import type { MouseEventHandler } from 'react';

type Props = Readonly<{
  onClick: MouseEventHandler<HTMLButtonElement> | undefined;
  loading: boolean;
}>;

/**
 * Update bluetooth information
 *
 * Icon ref
 * - https://mui.com/material-ui/material-icons/
 */
export function RestartButton({ onClick, loading }: Props) {
  const { t } = useTranslation();

  return (
    <Tooltip title={t('restart-tooltip')}>
      <LoadingButton
        endIcon={<SyncIcon />}
        loading={loading}
        loadingPosition='end'
        onClick={onClick}
        sx={{
          width: '100%',
          minHeight: '40px',
        }}
        type='submit'
        variant='contained'
      >
        <span>{loading ? t('restarting-btn') : t('restart-btn')}</span>
      </LoadingButton>
    </Tooltip>
  );
}
