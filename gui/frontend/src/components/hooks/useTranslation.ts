import { type FallbackNs, type UseTranslationOptions, useTranslation as useI18n } from 'react-i18next';

import type { I18nKeys } from '@/lib/i18n';

import type { FlatNamespace, KeyPrefix } from 'i18next';

type $Tuple<T> = readonly [T?, ...T[]];
type UseTranslation = <
  Ns extends FlatNamespace | $Tuple<FlatNamespace> | undefined = undefined,
  KeyPre extends KeyPrefix<FallbackNs<Ns>> = undefined,
>(
  ns?: Ns,
  options?: UseTranslationOptions<KeyPre>,
) => { t: (key: I18nKeys) => string };

/**
 * useTranslation(react-i18next) Wrapper for type completion of translation keys.
 */
export const useTranslation: UseTranslation = (ns, options) => {
  const { t } = useI18n(ns, options);
  return {
    /** Get translation key. */
    t: (key) => t(key),
  };
};
