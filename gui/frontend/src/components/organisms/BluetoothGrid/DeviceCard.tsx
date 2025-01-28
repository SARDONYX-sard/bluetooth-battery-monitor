import { Headset } from '@mui/icons-material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import HeadsetOffIcon from '@mui/icons-material/HeadsetOff';
import UpdateIcon from '@mui/icons-material/Update';
import { Button, Card, CardActions, CardContent, CardHeader, IconButton, Tooltip, Typography } from '@mui/material';
import { useCallback } from 'react';

import { CircularProgressWithLabel } from '@/components/atoms/CircularWithLabel';
import { useRelativeTime } from '@/components/hooks/useRelativeTime';
import { useTranslation } from '@/components/hooks/useTranslation';
import { NOTIFY } from '@/lib/notify';
import { CONFIG } from '@/services/api/bluetooth_config';
import type { BluetoothDeviceInfo } from '@/services/api/bluetooth_finder';
import { type IconType, updateTrayIcon } from '@/services/api/sys_tray';

type Props = Readonly<{
  device: BluetoothDeviceInfo;
  iconType: IconType;
}>;

export const DeviceCard = ({ device, iconType }: Props) => {
  const { friendly_name, address, battery_level, is_connected, last_used, last_updated } = device;

  const cardClickHandler = useCallback(async () => {
    try {
      await updateTrayIcon(friendly_name, battery_level, is_connected, iconType);
      await CONFIG.write({
        ...(await CONFIG.read()),
        address,
      });
    } catch (err) {
      NOTIFY.error(`${err}`);
    }
  }, [friendly_name, battery_level, is_connected, iconType, address]);

  const powerOffColor = '#696969';
  const batteryColor = is_connected ? getBatteryColor(battery_level) : powerOffColor;
  const lastUpdatedRelative = useRelativeTime(last_updated);
  const { t } = useTranslation();

  return (
    <Card sx={{ minWidth: 205, margin: 3 }}>
      <CardContent>
        <Typography component='div' sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {friendly_name}
          <CircularProgressWithLabel progColor={batteryColor} value={battery_level} />{' '}
        </Typography>

        <CardHeader
          avatar={
            <IconButton aria-label='settings'>
              {is_connected ? <Headset /> : <HeadsetOffIcon style={{ color: powerOffColor }} />}
            </IconButton>
          }
          subheader={
            <>
              <Typography sx={{ display: 'flex', alignItems: 'center' }} variant='body2'>
                <UpdateIcon fontSize='small' sx={{ mr: 0.5, color: '#2196f3' }} />
                {t('last-used')}: {last_used}
              </Typography>
              <Typography color='textSecondary' sx={{ display: 'flex', alignItems: 'center', mt: 1 }} variant='body2'>
                <AccessTimeIcon fontSize='small' sx={{ mr: 0.5, color: '#4caf50' }} />
                <span style={{ color: '#4caf50', fontWeight: 'bold' }}>
                  {t('last-updated')}: {lastUpdatedRelative}
                </span>
              </Typography>
            </>
          }
        />
      </CardContent>

      <CardActions sx={{ justifyContent: 'end' }}>
        <Tooltip title={t('target-bt-id-tooltip')}>
          <Button onClick={cardClickHandler} size='small'>
            {t('target-bt-id')}
          </Button>
        </Tooltip>
      </CardActions>
    </Card>
  );
};

const getBatteryColor = (batteryLevel: number): string => {
  if (batteryLevel >= 40) {
    return '#4c7faf'; // blue
  }
  if (batteryLevel >= 30) {
    return '#ffeb3b'; // yellow
  }
  if (batteryLevel >= 20) {
    return '#ff9800'; // orange
  }
  return '#f44336'; // red
};
