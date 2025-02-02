import { type SelectChangeEvent, Tooltip } from '@mui/material';

import { useTranslation } from '@/components/hooks/useTranslation';
import { SelectWithLabel } from '@/components/molecules/SelectWithLabel';
import type { IconType } from '@/services/api/sys_tray';

export type IconTypeListProps = {
  iconType: IconType;
  handleIconType: (e: SelectChangeEvent<IconType>) => void;
};

export const IconTypeList = ({ iconType, handleIconType }: IconTypeListProps) => {
  const { t } = useTranslation();

  // Sort by Alphabet
  const menuItems = [
    { value: 'circle', label: t('icon-type.circle') },
    { value: 'number_box', label: t('icon-type.number-box') },
  ] as const;

  return (
    <Tooltip placement='top' title={t('icon-type.tooltip')}>
      <SelectWithLabel label={t('icon-type.label')} menuItems={menuItems} onChange={handleIconType} value={iconType} />
    </Tooltip>
  );
};
