import { Checkbox, FormControlLabel, Skeleton, TextField, Tooltip } from '@mui/material';
import { type ChangeEventHandler, useCallback, useEffect, useState } from 'react';
import { useDebounce } from 'react-use';
import { disable, enable, isEnabled } from 'tauri-plugin-autostart-api';

import { type Config, config } from '@/backend_api';
import { notify } from '@/components/notifications';
import { useTranslation } from '@/hooks';

export const ConfigFields = () => {
  const { t } = useTranslation();
  const [isAutoStart, setIsAutoStart] = useState<boolean | null>(null);
  const [conf, setConf] = useState<Config | null>(null);
  const interval = conf?.battery_query_duration_minutes;
  const warnTime = conf?.notify_battery_level;

  useEffect(() => {
    (async () => {
      setIsAutoStart(await isEnabled());
      setConf(await config.read());
    })();
  }, []);

  useDebounce(
    async () => {
      try {
        if (conf) {
          await config.write(conf);
        }
      } catch (err) {
        notify.error(`${err}`);
      }
    },
    2000,
    [conf],
  );

  const handleAutoStart = useCallback(async () => {
    const newIsAuto = !isAutoStart;

    setIsAutoStart(newIsAuto);
    if (newIsAuto) {
      await enable();
    } else {
      await disable();
    }
  }, [isAutoStart]);

  const handleInterval: ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement> = (e) => {
    const newValue = Number(e.target.value);
    const newTime = Number.isNaN(newValue) ? 30 : newValue;

    if (conf) {
      if (conf.battery_query_duration_minutes === newTime) {
        return;
      }

      setConf({
        ...conf,
        // biome-ignore lint/style/useNamingConvention: <explanation>
        battery_query_duration_minutes: newTime,
      });
    }
  };

  const handleWarnPerLevel: ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement> = (e) => {
    const newValue = Number(e.target.value);
    const newPer = Number.isNaN(newValue) ? 20 : newValue;
    if (conf) {
      if (conf.notify_battery_level === newPer) {
        return;
      }

      setConf({
        ...conf,
        // biome-ignore lint/style/useNamingConvention: <explanation>
        notify_battery_level: newPer,
      });
    }
  };

  return (
    <>
      {isAutoStart !== null ? (
        <Tooltip title={t('autostart-tooltip')}>
          <FormControlLabel
            control={<Checkbox checked={isAutoStart} onClick={handleAutoStart} />}
            label={t('autostart-label')}
            sx={{ m: 1, minWidth: 105 }}
          />
        </Tooltip>
      ) : (
        <Skeleton height={10} width={105} />
      )}

      {interval !== undefined ? (
        <Tooltip title={t('update-interval-tooltip')}>
          <TextField
            InputLabelProps={{ shrink: true }}
            InputProps={{ inputProps: { min: 1 } }}
            error={interval < 1}
            helperText={interval < 1 ? '1 <= N' : ''}
            id='outlined-number'
            label={t('update-interval')}
            onChange={handleInterval}
            sx={{ m: 1, minWidth: 105, width: 105 }}
            type='number'
            value={interval}
          />
        </Tooltip>
      ) : (
        <Skeleton height={10} width={105} />
      )}

      {warnTime !== undefined ? (
        <Tooltip title={t('warn-limit-battery-tooltip')}>
          <TextField
            InputLabelProps={{ shrink: true }}
            InputProps={{ inputProps: { min: 0 } }}
            error={warnTime < 0 || 100 < warnTime}
            helperText={warnTime < 0 || 100 < warnTime ? '0 <= N <= 100' : ''}
            id='outlined-number'
            label={t('warn-limit-battery')}
            onChange={handleWarnPerLevel}
            sx={{ m: 1, minWidth: 105, width: 105 }}
            type='number'
            value={warnTime}
          />
        </Tooltip>
      ) : (
        <Skeleton height={10} width={105} />
      )}
    </>
  );
};
