export interface CurrencyOption {
  code: string;
  symbol: string;
  label: string;
  flag: string;
  rate: number; // relative to USD
}

export const SUPPORTED_CURRENCIES: CurrencyOption[] = [
  { code: 'USD', symbol: '$', label: 'US Dollar', flag: '🇺🇸', rate: 1 },
  { code: 'EUR', symbol: '€', label: 'Euro', flag: '🇪🇺', rate: 0.92 },
  { code: 'GBP', symbol: '£', label: 'British Pound', flag: '🇬🇧', rate: 0.79 },
  { code: 'MAD', symbol: 'د.م.', label: 'Moroccan Dirham', flag: '🇲🇦', rate: 10.0 },
  { code: 'SAR', symbol: '﷼', label: 'Saudi Riyal', flag: '🇸🇦', rate: 3.75 },
  { code: 'AED', symbol: 'د.إ', label: 'UAE Dirham', flag: '🇦🇪', rate: 3.67 },
  { code: 'EGP', symbol: 'ج.م', label: 'Egyptian Pound', flag: '🇪🇬', rate: 30.9 },
  { code: 'CNY', symbol: '¥', label: 'Chinese Yuan', flag: '🇨🇳', rate: 7.24 },
  { code: 'CAD', symbol: 'C$', label: 'Canadian Dollar', flag: '🇨🇦', rate: 1.36 },
  { code: 'AUD', symbol: 'A$', label: 'Australian Dollar', flag: '🇦🇺', rate: 1.53 },
];

export const DEFAULT_CURRENCY = 'USD';

export function convertPrice(amountUSD: number, targetCurrency: string): number {
  const currency = SUPPORTED_CURRENCIES.find((c) => c.code === targetCurrency);
  if (!currency) return amountUSD;
  return parseFloat((amountUSD * currency.rate).toFixed(2));
}

export function formatPrice(amount: number, currencyCode: string): string {
  const currency = SUPPORTED_CURRENCIES.find((c) => c.code === currencyCode);
  if (!currency) return `$${amount.toFixed(2)}`;
  
  // RTL currencies: symbol after amount
  const rtlCurrencies = ['MAD', 'SAR', 'AED', 'EGP'];
  if (rtlCurrencies.includes(currencyCode)) {
    return `${amount.toFixed(2)} ${currency.symbol}`;
  }
  return `${currency.symbol}${amount.toFixed(2)}`;
}

export function getCurrencySymbol(currencyCode: string): string {
  return SUPPORTED_CURRENCIES.find((c) => c.code === currencyCode)?.symbol || '$';
}
