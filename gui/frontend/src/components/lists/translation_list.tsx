import { FormControl, InputLabel } from '@mui/material';
import MenuItem from '@mui/material/MenuItem';
import Select, { type SelectChangeEvent } from '@mui/material/Select';
import { changeLanguage } from 'i18next';

import { useStorageState, useTranslation } from '@/hooks';

export const TranslationList = () => {
  const [lang, setLang] = useStorageState('locale', 'auto');
  const { t } = useTranslation();

  const handleChange = (e: SelectChangeEvent<string>) => {
    const newLocale = e.target.value;
    setLang(newLocale);
    changeLanguage(newLocale === 'auto' ? window.navigator.language : newLocale);
  };

  const locale = 'Locale';
  return (
    <FormControl sx={{ m: 1, minWidth: 135 }} variant='filled'>
      <InputLabel id='locale-select-label'>{t('lang-preset-label')}</InputLabel>
      <Select
        MenuProps={{ disableScrollLock: true }}
        id='locale-select'
        label={locale}
        labelId='locale-select-label'
        onChange={handleChange}
        value={lang}
      >
        <MenuItem value={'auto'}>{t('lang-preset-auto')}</MenuItem>
        <MenuItem value={'en-US'}>English(US)</MenuItem>
        <MenuItem value={'ja-JP'}>Japanese</MenuItem>
        <MenuItem value={'custom'}>{t('lang-preset-custom')}</MenuItem>
      </Select>
    </FormControl>
  );
};
