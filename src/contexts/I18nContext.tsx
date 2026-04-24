'use client';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Language, DEFAULT_LANGUAGE, getTranslations, getLanguageDir, SUPPORTED_LANGUAGES } from '@/lib/i18n';
import { DEFAULT_CURRENCY, SUPPORTED_CURRENCIES, convertPrice, formatPrice } from '@/lib/currencies';

interface I18nContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  currency: string;
  setCurrency: (code: string) => void;
  t: (key: string) => string;
  dir: 'ltr' | 'rtl';
  formatAmount: (usdAmount: number) => string;
  convertAmount: (usdAmount: number) => number;
  currencySymbol: string;
}

const I18nContext = createContext<I18nContextValue>({
  language: DEFAULT_LANGUAGE,
  setLanguage: () => {},
  currency: DEFAULT_CURRENCY,
  setCurrency: () => {},
  t: (key) => key,
  dir: 'rtl',
  formatAmount: (a) => `$${a}`,
  convertAmount: (a) => a,
  currencySymbol: '$',
});

export const useI18n = () => useContext(I18nContext);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(DEFAULT_LANGUAGE);
  const [currency, setCurrencyState] = useState<string>(DEFAULT_CURRENCY);
  const [translations, setTranslations] = useState<Record<string, string>>(getTranslations(DEFAULT_LANGUAGE));

  useEffect(() => {
    // Load saved preferences from localStorage
    try {
      const savedLang = localStorage.getItem('hn_language') as Language | null;
      const savedCurrency = localStorage.getItem('hn_currency');
      if (savedLang && SUPPORTED_LANGUAGES.find((l) => l.code === savedLang)) {
        setLanguageState(savedLang);
        setTranslations(getTranslations(savedLang));
      }
      if (savedCurrency && SUPPORTED_CURRENCIES.find((c) => c.code === savedCurrency)) {
        setCurrencyState(savedCurrency);
      }
    } catch {
      // localStorage not available
    }
  }, []);

  useEffect(() => {
    // Update html dir and lang attributes
    try {
      const dir = getLanguageDir(language);
      document.documentElement.setAttribute('lang', language);
      document.documentElement.setAttribute('dir', dir);
    } catch {
      // SSR
    }
  }, [language]);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    setTranslations(getTranslations(lang));
    try {
      localStorage.setItem('hn_language', lang);
    } catch {}
  }, []);

  const setCurrency = useCallback((code: string) => {
    setCurrencyState(code);
    try {
      localStorage.setItem('hn_currency', code);
    } catch {}
  }, []);

  const t = useCallback((key: string): string => {
    return translations[key] || key;
  }, [translations]);

  const dir = getLanguageDir(language);

  const formatAmount = useCallback((usdAmount: number): string => {
    return formatPrice(convertPrice(usdAmount, currency), currency);
  }, [currency]);

  const convertAmount = useCallback((usdAmount: number): number => {
    return convertPrice(usdAmount, currency);
  }, [currency]);

  const currencySymbol = SUPPORTED_CURRENCIES.find((c) => c.code === currency)?.symbol || '$';

  return (
    <I18nContext.Provider value={{ language, setLanguage, currency, setCurrency, t, dir, formatAmount, convertAmount, currencySymbol }}>
      {children}
    </I18nContext.Provider>
  );
}
