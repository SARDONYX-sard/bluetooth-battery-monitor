import SyncIcon from '@mui/icons-material/Sync';
import { useCallback } from 'react';

import { useTranslation } from '@/components/hooks/useTranslation';
import { LoadingButtonWithToolTip } from '@/components/molecules/LoadingButtonWithToolTip';
import { NOTIFY } from '@/lib/notify';
import { type Devices, restartDeviceWatcher } from '@/services/api/bluetooth_finder';
import { deviceListener } from '@/services/api/device_listener';
import { defaultTrayIcon } from '@/services/api/sys_tray';

import { useDevicesContext } from './DevicesProvider';

let unlisten: (() => void) | undefined;

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

        if (unlisten) {
          unlisten();
        }
        unlisten = await deviceListener({
          setDev: (devices: Devices) => {
            setLoading(false);
            setDevices(devices);
          },
        });

        await restartDeviceWatcher();
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
