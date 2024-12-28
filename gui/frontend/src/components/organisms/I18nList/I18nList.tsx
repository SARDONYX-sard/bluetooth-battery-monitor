import { changeLanguage } from 'i18next';
import { useState } from 'react';

import { useTranslation } from '@/components/hooks/useTranslation';
import { SelectWithLabel } from '@/components/molecules/SelectWithLabel';
import { LANG } from '@/lib/i18n';

import type { SelectChangeEvent } from '@mui/material/Select';

export const I18nList = () => {
  const [lang, setLang] = useState(LANG.get());
  const { t } = useTranslation();

  const handleChange = async ({ target }: SelectChangeEvent) => {
    const newLocale = LANG.normalize(target.value);
    await changeLanguage(newLocale);

    const cacheLocale = target.value === 'auto' ? 'auto' : newLocale;
    setLang(cacheLocale);
    LANG.set(cacheLocale);
  };

  const menuItems = [
    { value: 'auto', label: t('lang-preset-auto') },
    { value: 'en-US', label: 'English(US)' },
    { value: 'ja-JP', label: 'Japanese' },
    { value: 'custom', label: t('lang-preset-custom') },
  ] as const;

  return <SelectWithLabel label={t('lang-preset-label')} menuItems={menuItems} onChange={handleChange} value={lang} />;
};
