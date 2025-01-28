import { useDebounce } from 'react-use';

import type { IconTypeListProps } from '@/components/organisms/IconTypeList/IconTypeList';
import { NOTIFY } from '@/lib/notify';
import { CONFIG } from '@/services/api/bluetooth_config';
import { normalizeIconType, updateTrayIcon } from '@/services/api/sys_tray';

import { IconTypeList } from '../IconTypeList';

import { AutoStartSwitch } from './AutoStartSwitch';
import { useDevicesContext } from './DevicesProvider';
import { NumericField } from './NumericField';

import type { ChangeEvent } from 'react';

export const ConfigFields = () => {
  const { config, setConfig, devices } = useDevicesContext();
  const interval = config?.battery_query_duration_minutes ?? 60;
  const warnTime = config?.notify_battery_level ?? 20;
  const iconType = config?.icon_type ?? 'circle';

  useDebounce(
    async () => {
      try {
        if (config) {
          await CONFIG.write(config);
        }
      } catch (err) {
        NOTIFY.error(`${err}`);
      }
    },
    2000,
    [config],
  );

  const handleInterval = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newValue = Number(e.target.value);
    const newTime = Number.isNaN(newValue) ? 30 : newValue;

    if (config) {
      if (config.battery_query_duration_minutes === newTime) {
        return;
      }

      setConfig({
        ...config,
        // biome-ignore lint/style/useNamingConvention: <explanation>
        battery_query_duration_minutes: newTime,
      });
    }
  };

  const handleWarnPerLevel = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newValue = Number(e.target.value);
    const newPer = Number.isNaN(newValue) ? 20 : newValue;
    if (config) {
      if (config.notify_battery_level === newPer) {
        return;
      }

      setConfig({
        ...config,
        // biome-ignore lint/style/useNamingConvention: <explanation>
        notify_battery_level: newPer,
      });
    }
  };

  const handleIconType: IconTypeListProps['handleIconType'] = async (e) => {
    if (config) {
      const newIconType = normalizeIconType(e.target.value);
      const device = devices?.[config.address];
      if (device) {
        const { friendly_name, battery_level, is_connected } = device;
        await updateTrayIcon(friendly_name, battery_level, is_connected, newIconType);
      }
      setConfig({
        ...config,
        // biome-ignore lint/style/useNamingConvention: <explanation>
        icon_type: newIconType,
      });
    }
  };

  return (
    <>
      <AutoStartSwitch />
      <NumericField
        errorCondition={interval < 1}
        errorMessage='1 <= N'
        label='update-interval'
        minValue={1}
        onChange={handleInterval}
        tooltipKey='update-interval-tooltip'
        value={interval}
      />
      <NumericField
        errorCondition={warnTime < 0 || warnTime > 100}
        errorMessage='0 <= N <= 100'
        label='warn-limit-battery'
        minValue={0}
        onChange={handleWarnPerLevel}
        tooltipKey='warn-limit-battery-tooltip'
        value={warnTime}
      />
      <IconTypeList handleIconType={handleIconType} iconType={iconType} />
    </>
  );
};
