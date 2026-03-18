// frontend/src/types/currency.ts
export type CurrencyCode = 'USD' | 'KES' | 'EUR';

export interface Currency {
  code: CurrencyCode;
  symbol: string;
  name: string;
  flag: string;
  exchangeRate: number;
  decimalPlaces: number;
}

export const SUPPORTED_CURRENCIES: Record<CurrencyCode, Currency> = {
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    flag: '🇺🇸',
    exchangeRate: 1,
    decimalPlaces: 2,
  },
  KES: {
    code: 'KES',
    symbol: 'KSh',
    name: 'Kenyan Shilling',
    flag: '🇰🇪',
    exchangeRate: 130,
    decimalPlaces: 2,
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    flag: '🇪🇺',
    exchangeRate: 0.92,
    decimalPlaces: 2,
  },
};