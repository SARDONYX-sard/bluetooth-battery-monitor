import { Headset } from '@mui/icons-material';
import HeadsetOffIcon from '@mui/icons-material/HeadsetOff';
import { Button, Card, CardActions, CardContent, CardHeader, IconButton, Tooltip, Typography } from '@mui/material';
import { useCallback } from 'react';

import { CircularProgressWithLabel } from '@/components/atoms/CircularWithLabel';
import { useTranslation } from '@/components/hooks/useTranslation';
import { NOTIFY } from '@/lib/notify';
import { CONFIG } from '@/services/api/bluetooth_config';
import type { BluetoothDeviceInfo } from '@/services/api/bluetooth_finder';
import { updateTrayIcon } from '@/services/api/sys_tray';

type Props = Readonly<{
  device: BluetoothDeviceInfo;
}>;

export const DeviceCard = ({ device }: Props) => {
  const { friendly_name, address, battery_level, category, is_connected, last_used } = device;
  const { t } = useTranslation();
  const powerOffColor = '#696969';

  const cardClickHandler = useCallback(async () => {
    try {
      await updateTrayIcon(friendly_name, battery_level);
      await CONFIG.write({
        ...(await CONFIG.read()),
        address,
      });
    } catch (err) {
      NOTIFY.error(`${err}`);
    }
  }, [battery_level, friendly_name, address]);

  return (
    <Card sx={{ minWidth: 205, margin: 3 }}>
      <CardContent>
        <Typography component='div' variant='h6'>
          {friendly_name}
        </Typography>

        <CardHeader
          action={
            <CircularProgressWithLabel progColor={is_connected ? undefined : powerOffColor} value={battery_level} />
          }
          avatar={
            <IconButton aria-label='settings'>
              {is_connected ? <Headset /> : <HeadsetOffIcon style={{ color: powerOffColor }} />}
            </IconButton>
          }
          subheader={last_used}
          title={category}
        />
      </CardContent>
      <CardActions>
        <Tooltip title={t('target-bt-id-tooltip')}>
          <Button onClick={cardClickHandler} size='small'>
            {t('target-bt-id')}
          </Button>
        </Tooltip>
      </CardActions>
    </Card>
  );
};
