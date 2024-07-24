import { Headset } from '@mui/icons-material';
import HeadsetOffIcon from '@mui/icons-material/HeadsetOff';
import { Button, Card, CardActions, CardContent, CardHeader, IconButton, Tooltip, Typography } from '@mui/material';
import { useCallback } from 'react';

import { type BluetoothDeviceInfo, config, updateTrayIcon } from '@/backend_api';
import { CircularProgressWithLabel, notify } from '@/components/notifications';
import { useTranslation } from '@/hooks';

type Props = Readonly<{
  device: BluetoothDeviceInfo;
}>;

export const DeviceCard = ({ device }: Props) => {
  const { friendly_name, battery_level, category, is_connected, last_used, instance_id } = device;
  const { t } = useTranslation();
  const powerOffColor = '#69696978';

  const cardClickHandler = useCallback(async () => {
    try {
      await updateTrayIcon(friendly_name, battery_level);
      await config.write({
        ...(await config.read()),
        instance_id,
      });
    } catch (err) {
      notify.error(`${err}`);
    }
  }, [battery_level, friendly_name, instance_id]);

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
