import SyncIcon from '@mui/icons-material/Sync';
import { useCallback } from 'react';

import { useTranslation } from '@/components/hooks/useTranslation';
import { LoadingButtonWithToolTip } from '@/components/molecules/LoadingButtonWithToolTip';
import { NOTIFY } from '@/lib/notify';
import { getDevices, restartDeviceWatcher } from '@/services/api/bluetooth_finder';
import { defaultTrayIcon } from '@/services/api/sys_tray';

import { useDevicesContext } from './DevicesProvider';

/**
 * Update bluetooth information
 *
 * Icon ref
 * - https://mui.com/material-ui/material-icons/
 */
export function RestartButton() {
  const { t } = useTranslation();
  const { setDevices, setLoading, loading } = useDevicesContext();

  const restartHandler = useCallback(() => {
    (async () => {
      try {
        setLoading(true);
        await defaultTrayIcon();
        await restartDeviceWatcher();
        setDevices(await getDevices());
        setLoading(false);
      } catch (err) {
        NOTIFY.error(`${err}`);
      }
    })();
  }, [setDevices, setLoading]);

  return (
    <LoadingButtonWithToolTip
      buttonName={loading ? t('restarting-btn') : t('restart-btn')}
      icon={<SyncIcon />}
      loading={loading}
      loadingPosition='end'
      onClick={restartHandler}
      tooltipTitle={t('restart-tooltip')}
      type='submit'
      variant='outlined'
    />
  );
}
