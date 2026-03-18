import React from 'react';
import type { InvestmentSummary as InvestmentSummaryType } from '../../types';
import {
  CurrencyDollarIcon,
  ChartBarIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
} from '@heroicons/react/24/outline';
import { useCurrency } from '../../contexts/CurrencyContext';

interface InvestmentSummaryProps {
  summary: InvestmentSummaryType;
  currency?: string;
  convertAmount?: (amount: number, from: string, to: string) => number;
  formatAmount?: (amount: number, currencyCode: string) => string;
}

const InvestmentSummary: React.FC<InvestmentSummaryProps> = ({
  summary,
  currency: propCurrency,
  convertAmount: propConvertAmount,
  formatAmount: propFormatAmount
}) => {
  const { currency, convertAmount, formatAmount, showConverted } = useCurrency();

  // Helper function to parse numeric values
  const parseNumeric = (value: any): number => {
    if (value === null || value === undefined) return 0;
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const parsed = parseFloat(value);
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  };

  // Use props if provided, otherwise use context
  const activeCurrency = propCurrency || currency.code;
  const activeConvertAmount = propConvertAmount || convertAmount;
  const activeFormatAmount = propFormatAmount || formatAmount;
  const shouldShowConverted = propCurrency ? propCurrency !== 'USD' : showConverted;

  // Parse all summary values
  const totalInvested = parseNumeric(summary.total_invested);
  const totalEarned = parseNumeric(summary.total_earned);
  const expectedReturns = parseNumeric(summary.expected_returns);
  const projectedProfit = parseNumeric(summary.projected_profit);
  const activeAmount = parseNumeric(summary.active_amount);

  const formatCurrency = (amountUSD: number) => {
    if (!shouldShowConverted) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amountUSD);
    }

    const converted = activeConvertAmount(amountUSD, 'USD', activeCurrency as any);
    return activeFormatAmount(converted, activeCurrency as any);
  };

  const cards = [
    {
      title: 'Total Invested',
      value: formatCurrency(totalInvested),
      usdValue: totalInvested,
      icon: CurrencyDollarIcon,
      bgColor: 'bg-[#0A1929]',
      iconBg: 'bg-[#0A1929]',
      borderColor: 'border-[#F97316]',
    },
    {
      title: 'Active Investments',
      value: summary.active_investments?.toString() || '0',
      subtitle: `${formatCurrency(activeAmount)}`,
      usdValue: activeAmount,
      icon: ChartBarIcon,
      bgColor: 'bg-[#0A1929]',
      iconBg: 'bg-[#0A1929]',
      borderColor: 'border-[#F97316]',
    },
    {
      title: 'Total Earned',
      value: formatCurrency(totalEarned),
      usdValue: totalEarned,
      icon: ClockIcon,
      bgColor: 'bg-[#0A1929]',
      iconBg: 'bg-[#0A1929]',
      borderColor: 'border-[#F97316]',
    },
    {
      title: 'Expected Returns',
      value: formatCurrency(expectedReturns),
      subtitle: `Profit: ${formatCurrency(projectedProfit)}`,
      usdValue: expectedReturns,
      icon: ArrowTrendingUpIcon,
      bgColor: 'bg-[#0A1929]',
      iconBg: 'bg-[#0A1929]',
      borderColor: 'border-[#F97316]',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => (
        <div
          key={index}
          className={`${card.bgColor} rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border-2 ${card.borderColor} border-opacity-30 hover:border-opacity-100`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`${card.iconBg} p-3 rounded-lg border border-[#F97316]`}>
              <card.icon className="w-6 h-6 text-[#F97316]" />
            </div>
            {shouldShowConverted && (
              <span className="text-xs font-medium text-[#F97316] bg-[#F97316] bg-opacity-10 px-2 py-1 rounded-full">
                {activeCurrency}
              </span>
            )}
          </div>
          <h3 className="text-sm font-medium text-gray-300 mb-1">{card.title}</h3>
          <p className="text-2xl font-bold text-white">{card.value}</p>
          {card.subtitle && (
            <p className="text-sm text-[#F97316] mt-1 font-medium">{card.subtitle}</p>
          )}
          {shouldShowConverted && card.title !== 'Active Investments' && (
            <div className="mt-3 pt-3 border-t border-gray-700">
              <p className="text-xs text-gray-400">
                USD {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                  minimumFractionDigits: 0,
                }).format(card.usdValue)}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default InvestmentSummary;