import en from '@/locales/en.json';
import ar from '@/locales/ar.json';
import fr from '@/locales/fr.json';
import es from '@/locales/es.json';
import zh from '@/locales/zh.json';

export type Language = 'en' | 'ar' | 'fr' | 'es' | 'zh';

export interface LanguageOption {
  code: Language;
  label: string;
  nativeLabel: string;
  dir: 'ltr' | 'rtl';
  flag: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', label: 'English', nativeLabel: 'English', dir: 'ltr', flag: '🇬🇧' },
  { code: 'ar', label: 'Arabic', nativeLabel: 'العربية', dir: 'rtl', flag: '🇸🇦' },
  { code: 'fr', label: 'French', nativeLabel: 'Français', dir: 'ltr', flag: '🇫🇷' },
  { code: 'es', label: 'Spanish', nativeLabel: 'Español', dir: 'ltr', flag: '🇪🇸' },
  { code: 'zh', label: 'Chinese', nativeLabel: '中文', dir: 'ltr', flag: '🇨🇳' },
];

const translations: Record<Language, Record<string, string>> = { en, ar, fr, es, zh };

export function getTranslations(language: Language): Record<string, string> {
  return translations[language] || translations['en'];
}

export function getLanguageDir(language: Language): 'ltr' | 'rtl' {
  return SUPPORTED_LANGUAGES.find((l) => l.code === language)?.dir || 'ltr';
}

export const DEFAULT_LANGUAGE: Language = 'ar';
