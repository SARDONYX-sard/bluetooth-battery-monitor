import { type Resource, use } from 'i18next';
import { initReactI18next } from 'react-i18next';
import { z } from 'zod';

import { NOTIFY } from '@/lib/notify';
import { STORAGE } from '@/lib/storage';
import { PUB_CACHE_OBJ } from '@/lib/storage/cacheKeys';
import { schemaStorage } from '@/lib/storage/schemaStorage';

import dictEnUs from '@/../../locales/en-US.json';
import dictJaJp from '@/../../locales/ja-JP.json';

/** The keys in RESOURCE are language tags according to the BCP-47 standard.
    - See: https://partnerhub.warnermediagroup.com/metadata/languages */
const RESOURCES = {
  'en-US': {
    translation: dictEnUs,
  },
  'ja-JP': {
    translation: dictJaJp,
  },
  custom: { translation: NOTIFY.try(() => JSON.parse(STORAGE.get('custom-translation-dict') ?? '{}')) },
} as const satisfies Resource;

/** The actual item to be set in the library. This must be a Key that exists in `RESOURCES`. */
type ValidI18n = keyof typeof RESOURCES;
/** Values of i18n selectable items */
type I18nListValue = 'auto' | ValidI18n;

type FlattenKeys<T extends object, P extends string = ''> = {
  [K in keyof T]: T[K] extends object ? FlattenKeys<T[K], `${P}${K & string}.`> : `${P}${K & string}`;
}[keyof T];

export type I18nKeys = FlattenKeys<(typeof RESOURCES)['en-US']['translation']>;

/**
 * Default if `null` or `undefined`.
 * @default `en-US`
 */
const normalize = (str: string | null): ValidI18n => {
  switch (str === null || str === 'auto' ? window.navigator.language : str) {
    case 'ja':
    case 'ja-JP':
      return 'ja-JP';
    case 'custom':
      return 'custom';
    default:
      return 'en-US';
  }
};

// Define a schema for the valid I18n values
const i18nSchema = z.string();

export const LANG = {
  /**
   * NOTE: This is intended to be done automatically the moment global import is done each time on the previous page in `src/app/layout.tsx`
   * - ref: https://react.i18next.com/guides/quick-start#configure-i18next
   */
  init() {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    use(initReactI18next) // passes i18n down to react-i18next
      .init({
        resources: RESOURCES,
        lng: normalize(schemaStorage.get(PUB_CACHE_OBJ.locale, i18nSchema)),
        fallbackLng: 'en-US',
        interpolation: {
          escapeValue: false, // react already safes from xss
        },
      });
  },

  normalize,

  /** get current log level from `LocalStorage`. */
  get(): I18nListValue {
    const locale = schemaStorage.get(PUB_CACHE_OBJ.locale, i18nSchema);
    const isAuto = [null, 'auto'].some((val) => val === locale);
    return isAuto ? 'auto' : normalize(locale);
  },

  /** set log level to `LocalStorage`. */
  set(lang: I18nListValue) {
    schemaStorage.set(PUB_CACHE_OBJ.locale, lang);
  },
} as const;
