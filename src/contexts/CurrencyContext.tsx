import React, { createContext, useState, useContext, useEffect, type ReactNode } from 'react';
import type { CurrencyCode, Currency, CurrencyContextType, CurrencyRates } from '../types/currency';
import { SUPPORTED_CURRENCIES } from '../types/currency';

// Create context
const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

// Custom hook
export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};

// Provider props interface
interface CurrencyProviderProps {
  children: ReactNode;
}

export const CurrencyProvider: React.FC<CurrencyProviderProps> = ({ children }) => {
  const [currency, setCurrencyState] = useState<Currency>(SUPPORTED_CURRENCIES.USD);
  const [isLoadingRates, setIsLoadingRates] = useState(false);
  const [showConverted, setShowConverted] = useState(true);
  const [rates, setRates] = useState<CurrencyRates>({
    USD: 1,
    KES: 130,
    EUR: 0.92,
    lastUpdated: new Date().toISOString(),
  });

  // Load saved currency preference from localStorage
  useEffect(() => {
    const savedCurrency = localStorage.getItem('preferred_currency') as CurrencyCode;
    if (savedCurrency && SUPPORTED_CURRENCIES[savedCurrency]) {
      setCurrencyState(SUPPORTED_CURRENCIES[savedCurrency]);
    }
  }, []);

  // Fetch latest exchange rates (optional)
  useEffect(() => {
    const fetchRates = async () => {
      setIsLoadingRates(false);
    };
    fetchRates();
  }, []);

  const setCurrency = (code: CurrencyCode) => {
    if (SUPPORTED_CURRENCIES[code]) {
      setCurrencyState(SUPPORTED_CURRENCIES[code]);
      localStorage.setItem('preferred_currency', code);
    }
  };

  const convertAmount = (
    amount: number,
    fromCurrency: CurrencyCode = 'USD',
    toCurrency: CurrencyCode = currency.code
  ): number => {
    if (amount === 0 || amount === null || amount === undefined) return 0;
    if (fromCurrency === toCurrency) return amount;

    console.log(`Converting ${amount} from ${fromCurrency} to ${toCurrency}`);

    // Get exchange rates
    const fromRate = SUPPORTED_CURRENCIES[fromCurrency]?.exchangeRate || 1;
    const toRate = SUPPORTED_CURRENCIES[toCurrency]?.exchangeRate || 1;

    console.log(`From rate: ${fromRate}, To rate: ${toRate}`);

    // Convert to USD first, then to target currency
    const amountInUSD = amount / fromRate;
    const convertedAmount = amountInUSD * toRate;

    console.log(`Amount in USD: ${amountInUSD}, Converted: ${convertedAmount}`);

    return Number(convertedAmount.toFixed(SUPPORTED_CURRENCIES[toCurrency]?.decimalPlaces || 2));
  };

  const formatAmount = (amount: number, currencyCode?: CurrencyCode): string => {
    const targetCurrency = currencyCode ? SUPPORTED_CURRENCIES[currencyCode] : currency;

    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: targetCurrency.code,
      minimumFractionDigits: targetCurrency.decimalPlaces,
      maximumFractionDigits: targetCurrency.decimalPlaces,
    }).format(amount).replace(/^(\D+)/, targetCurrency.symbol);
  };

  const value: CurrencyContextType = {
    currency,
    setCurrency,
    convertAmount,
    formatAmount,
    availableCurrencies: Object.values(SUPPORTED_CURRENCIES),
    isLoadingRates,
    showConverted,
    setShowConverted,
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
};