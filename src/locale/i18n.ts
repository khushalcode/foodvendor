import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

import en from '../../assets/language/en.json';
import ar from '../../assets/language/ar.json';
import bn from '../../assets/language/bn.json';
import es from '../../assets/language/es.json';
import fr from '../../assets/language/fr.json';

export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', flag: 'english', dir: 'ltr' as const },
  { code: 'ar', name: 'العربية', flag: 'arabic', dir: 'rtl' as const },
  { code: 'bn', name: 'বাংলা', flag: 'bangla', dir: 'ltr' as const },
  { code: 'es', name: 'Español', flag: 'spanish', dir: 'ltr' as const },
  { code: 'fr', name: 'Français', flag: 'french', dir: 'ltr' as const },
];

const STORAGE_KEY = 'app_language';

// Bootstrap i18next synchronously with English so the first render is non-empty.
// The saved language (if any) is loaded below in `initI18n()`.
i18next.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ar: { translation: ar },
    bn: { translation: bn },
    es: { translation: es },
    fr: { translation: fr },
  },
  lng: 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
  returnNull: false,
});

export async function initI18n() {
  try {
    const saved = await AsyncStorage.getItem(STORAGE_KEY);
    if (saved && SUPPORTED_LANGUAGES.some((l) => l.code === saved)) {
      await i18next.changeLanguage(saved);
    } else {
      const device = Localization.getLocales()[0]?.languageCode;
      if (device && SUPPORTED_LANGUAGES.some((l) => l.code === device)) {
        await i18next.changeLanguage(device);
      }
    }
  } catch (e) {
    // ignore — fall back to English
  }
}

export async function changeLanguage(code: string) {
  await i18next.changeLanguage(code);
  await AsyncStorage.setItem(STORAGE_KEY, code);
}

export function getCurrentLanguage() {
  return i18next.language || 'en';
}

export function isRTL() {
  const lang = getCurrentLanguage();
  return SUPPORTED_LANGUAGES.find((l) => l.code === lang)?.dir === 'rtl';
}

export default i18next;
