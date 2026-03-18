// frontend/src/hooks/useCurrencyFormat.ts
import { useCurrency } from '../contexts/CurrencyContext';

export const useCurrencyFormat = () => {
  const { currency, convertAmount, formatAmount } = useCurrency();

  const formatWithCurrency = (amountUSD: number, showConverted: boolean = true, targetCurrency?: string) => {
    if (typeof amountUSD !== 'number' || isNaN(amountUSD)) {
      return showConverted ? `0 ${targetCurrency || currency.code}` : '$0';
    }

    if (!showConverted) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amountUSD);
    }

    const target = targetCurrency || currency.code;
    const converted = convertAmount(amountUSD, 'USD', target as any);
    return formatAmount(converted, target as any);
  };

  const formatUSDBalance = (amountUSD: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amountUSD);
  };

  return {
    formatWithCurrency,
    formatUSDBalance,
  };
};