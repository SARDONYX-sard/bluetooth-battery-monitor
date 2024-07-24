import { type FlatNamespace, type KeyPrefix, changeLanguage } from 'i18next';
import { useEffect } from 'react';
import { type FallbackNs, type UseTranslationOptions, useTranslation as useTrans } from 'react-i18next';

import { localStorageManager } from '@/utils/local_storage_manager';
import type { I18nKeys } from '@/utils/translation';

/**
 * Change language
 */
export function useLocale() {
  useEffect(() => {
    const locale = localStorageManager.get('locale') ?? window.navigator.language;
    changeLanguage(locale === 'auto' ? window.navigator.language : locale);
  }, []);
}

type $Tuple<T> = readonly [T?, ...T[]];
type UseTranslation = <
  Ns extends FlatNamespace | $Tuple<FlatNamespace> | undefined = undefined,
  // biome-ignore lint/style/useNamingConvention: <explanation>
  KPrefix extends KeyPrefix<FallbackNs<Ns>> = undefined,
>(
  ns?: Ns,
  options?: UseTranslationOptions<KPrefix>,
) => { t: (key: I18nKeys) => string };

/**
 * useTranslation(react-i18next) Wrapper for type completion of translation keys.
 */
export const useTranslation: UseTranslation = (ns, options) => {
  const trans = useTrans(ns, options).t;
  return { t: (key) => trans(key as unknown as string) };
};
