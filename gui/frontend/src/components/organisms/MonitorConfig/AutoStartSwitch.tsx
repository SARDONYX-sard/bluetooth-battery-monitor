import { Checkbox, FormControlLabel, Skeleton, Tooltip } from '@mui/material';
import { disable, enable, isEnabled } from '@tauri-apps/plugin-autostart';
import { useCallback, useEffect, useState } from 'react';

import { useTranslation } from '@/components/hooks/useTranslation';
import { NOTIFY } from '@/lib/notify';

const TooltipPlacement = 'top';

export const AutoStartSwitch = () => {
  const { t } = useTranslation();
  const [isAutoStart, setIsAutoStart] = useState<boolean | null>(null);

  useEffect(() => {
    (async () => {
      await NOTIFY.asyncTry(async () => setIsAutoStart(await isEnabled()));
    })();
  }, []);

  const handleAutoStart = useCallback(async () => {
    const newIsAuto = !isAutoStart;
    setIsAutoStart(newIsAuto);

    if (newIsAuto) {
      await enable();
    } else {
      await disable();
    }
  }, [isAutoStart]);

  return isAutoStart !== null ? (
    <Tooltip arrow={true} placement={TooltipPlacement} title={t('autostart-tooltip')}>
      <FormControlLabel
        control={<Checkbox checked={isAutoStart} onClick={handleAutoStart} />}
        label={t('autostart-label')}
        sx={{ m: 1, minWidth: 105 }}
      />
    </Tooltip>
  ) : (
    <Skeleton height={10} width={105} />
  );
};
