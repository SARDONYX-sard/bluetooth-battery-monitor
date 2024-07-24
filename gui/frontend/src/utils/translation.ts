'use client';
import { type Resource, use } from 'i18next';
import { initReactI18next } from 'react-i18next';

import { notify } from '@/components/notifications';
import { localStorageManager } from '@/utils/local_storage_manager';

import dictEnUs from '@/../../locales/en-US.json';
import dictJaJp from '@/../../locales/ja-JP.json';

function getCustomTranslationDict() {
  try {
    return JSON.parse(localStorageManager.get('custom-translation-dict') ?? '{}');
  } catch (error) {
    notify.error(`${error}`);
  }
}

// The keys in RESOURCE are language tags according to the BCP-47 standard.
// See: https://partnerhub.warnermediagroup.com/metadata/languages
const resources = {
  'en-US': {
    translation: dictEnUs,
  },
  'ja-JP': {
    translation: dictJaJp,
  },
  ja: {
    translation: dictJaJp,
  },
  custom: { translation: getCustomTranslationDict() },
} as const satisfies Resource;

export type I18nKeys = keyof (typeof resources)['en-US']['translation'];

use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources,
    // NOTE:
    // Since it seems that `window.navigator.language` cannot automatically detect the language,
    // I have created a hook called useLocale as a substitute.
    lng: localStorageManager.get('locale') ?? window.navigator.language,
    fallbackLng: 'en-US',
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
  });
