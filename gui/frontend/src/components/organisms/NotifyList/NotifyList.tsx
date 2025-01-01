import { type ComponentPropsWithRef, useCallback, useState } from 'react';

import { useTranslation } from '@/components/hooks/useTranslation';
import { SelectWithLabel } from '@/components/molecules/SelectWithLabel';
import { NOTIFY_CONFIG } from '@/lib/notify/config';

import { MaxSnackField } from './MaxSnackField';

import type { SnackbarOrigin } from 'notistack';

type PosChangeHandler = Exclude<ComponentPropsWithRef<typeof SelectWithLabel>['onChange'], undefined>;
type SnackChangeHandler = ComponentPropsWithRef<typeof MaxSnackField>['onChange'];

export const NotifyList = () => {
  const def = NOTIFY_CONFIG.getOrDefault();
  const { t } = useTranslation();
  const [pos, setPos] = useState<SnackbarOrigin>(def.anchorOrigin);
  const [maxSnack, setMaxSnack] = useState<number>(def.maxSnack);

  const handlePosChange = useCallback<PosChangeHandler>(({ target }) => {
    const newPosition = NOTIFY_CONFIG.anchor.fromStr(target.value);
    NOTIFY_CONFIG.anchor.set(newPosition);
    setPos(newPosition);
  }, []);

  const handleMaxSnackChange: SnackChangeHandler = ({ target }) => {
    const newMaxSnack = NOTIFY_CONFIG.limit.fromStr(target.value);
    NOTIFY_CONFIG.limit.set(newMaxSnack);
    setMaxSnack(newMaxSnack);
  };

  const menuItems = [
    { value: 'top_right', label: t('notice-position-top-right') },
    { value: 'top_center', label: t('notice-position-top-center') },
    { value: 'top_left', label: t('notice-position-top-left') },
    { value: 'bottom_right', label: t('notice-position-bottom-right') },
    { value: 'bottom_center', label: t('notice-position-bottom-center') },
    { value: 'bottom_left', label: t('notice-position-bottom-left') },
  ] as const;

  return (
    <>
      <SelectWithLabel
        label={t('notice-position-list-label')}
        menuItems={menuItems}
        onChange={handlePosChange}
        value={`${pos.vertical}_${pos.horizontal}`}
      />
      <MaxSnackField label={t('notice-limit')} onChange={handleMaxSnackChange} value={maxSnack} />
    </>
  );
};
