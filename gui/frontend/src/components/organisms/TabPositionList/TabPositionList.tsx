import { useTranslation } from '@/components/hooks/useTranslation';
import { SelectWithLabel } from '@/components/molecules/SelectWithLabel';
import { tabPosSchema, useTabContext } from '@/components/providers/TabProvider';

import type { SelectChangeEvent } from '@mui/material/Select/Select';

export const TabPositionList = () => {
  const { t } = useTranslation();
  const { tabPos, setTabPos } = useTabContext();

  const handleChange = ({ target }: SelectChangeEvent) => {
    setTabPos(tabPosSchema.parse(target.value));
  };

  const menuItems = [
    { value: 'top', label: t('tab-list-position-top') },
    { value: 'bottom', label: t('tab-list-position-bottom') },
  ] as const;

  return (
    <SelectWithLabel
      label={t('tab-list-position-label')}
      menuItems={menuItems}
      onChange={handleChange}
      value={tabPos}
    />
  );
};
