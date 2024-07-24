import { FormControl, InputLabel, Tooltip } from '@mui/material';
import MenuItem from '@mui/material/MenuItem';
import Select, { type SelectChangeEvent } from '@mui/material/Select';

import { useTranslation } from '@/hooks';
import { presetStyles, selectPreset } from '@/utils/styles';

export type StyleListProps = {
  setStyle: (value: string) => void;
  setPreset: (value: string) => void;
  preset: string;
};

export const StyleList = ({ preset, setPreset, setStyle }: StyleListProps) => {
  const { t } = useTranslation();

  const handleChange = (e: SelectChangeEvent<string>) => {
    const presetNumber = selectPreset(e.target.value);
    setPreset(presetNumber);
    if (presetNumber === '0') {
      setStyle(localStorage.getItem('customCSS') ?? '');
      return;
    }
    setStyle(presetStyles[presetNumber]);
  };

  return (
    <Tooltip
      placement='right-end'
      title={
        <>
          <p>{t('css-preset-list-tooltip')}</p>
          <p>{t('css-preset-list-tooltip2')}</p>
        </>
      }
    >
      <FormControl sx={{ m: 1, minWidth: 110 }} variant='filled'>
        <InputLabel id='style-select-label'>{t('css-preset-list-label')}</InputLabel>
        <Select
          MenuProps={{ disableScrollLock: true }}
          id='style-select'
          label='CSS Presets'
          labelId='style-select-label'
          onChange={handleChange}
          value={preset}
        >
          <MenuItem value={'0'}>{t('css-preset-list-item0')}</MenuItem>
          <MenuItem value={'1'}>{t('css-preset-list-item1')}</MenuItem>
          <MenuItem value={'2'}>{t('css-preset-list-item2')}</MenuItem>
          <MenuItem value={'3'}>{t('css-preset-list-item3')}</MenuItem>
          <MenuItem value={'4'}>{t('css-preset-list-item4')}</MenuItem>
        </Select>
      </FormControl>
    </Tooltip>
  );
};
