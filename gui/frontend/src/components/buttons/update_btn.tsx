import SyncIcon from '@mui/icons-material/Sync';
import LoadingButton from '@mui/lab/LoadingButton';
import { Tooltip } from '@mui/material';
import { useState } from 'react';

import { useTranslation } from '@/hooks';

type Props = Readonly<{
  eventFn: () => Promise<void>;
}>;

/**
 * Update bluetooth information
 *
 * Icon ref
 * - https://mui.com/material-ui/material-icons/
 */
export function UpdateButton({ eventFn }: Props) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState<boolean>(false);

  return (
    <Tooltip title={t('update-tooltip')}>
      <LoadingButton
        endIcon={<SyncIcon />}
        loading={loading}
        loadingPosition='end'
        onChange={async () => {
          setLoading(true);
          await eventFn();
          setLoading(false);
        }}
        sx={{
          width: '100%',
          minHeight: '40px',
        }}
        type='submit'
        variant='contained'
      >
        <span>{loading ? t('updating-btn') : t('update-btn')}</span>
      </LoadingButton>
    </Tooltip>
  );
}
