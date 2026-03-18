import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { Product } from '../../types';
import { motion } from 'framer-motion';
import { useCurrency } from '../../contexts/CurrencyContext';
import {
  InformationCircleIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';

interface ProductCardProps {
  product: Product;
  onViewDetails?: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onViewDetails }) => {
  const { currency, convertAmount, formatAmount, showConverted } = useCurrency();

  // Debug log to see what we're getting
  useEffect(() => {
    console.log('ProductCard received:', {
      name: product.name,
      price: product.price,
      priceType: typeof product.price,
      dailyIncome: product.daily_income,
      totalReturn: product.total_return,
      roiPercentage: product.roi_percentage,
    });
  }, [product]);

  // Helper function to safely parse numeric values
  const parseNumeric = (value: any): number => {
    if (value === null || value === undefined) return 0;
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const parsed = parseFloat(value);
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  };

  // Safely get numeric values with parsing
  const price = parseNumeric(product.price);
  const dailyIncome = parseNumeric(product.daily_income);
  const validityPeriod = parseNumeric(product.validity_period);
  const totalReturn = parseNumeric(product.total_return);
  const roiPercentage = parseNumeric(product.roi_percentage);
  const bCommission = parseNumeric(product.b_commission);
  const cCommission = parseNumeric(product.c_commission);
  const dCommission = parseNumeric(product.d_commission);

  const formatCurrency = (amountUSD: number) => {
    if (!showConverted) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amountUSD);
    }

    const converted = convertAmount(amountUSD, 'USD', currency.code);
    return formatAmount(converted, currency.code);
  };

  const formatUSD = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-[#0A1929] rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-[#F97316]"
    >
      {/* Product Header */}
      <div className="bg-gradient-to-r from-[#0A1929] to-[#0F2744] px-6 py-4 border-b border-[#F97316] border-opacity-30">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-2xl font-bold text-white">{product.name}</h3>
            <p className="text-[#F97316]">Afro {product.name.split(' ')[1] || ''}</p>
          </div>
          {showConverted && (
            <span className="text-xs bg-[#F97316] bg-opacity-20 text-[#F97316] px-2 py-1 rounded-full border border-[#F97316]">
              {currency.code}
            </span>
          )}
        </div>
      </div>

      {/* Price */}
      <div className="px-6 py-4 border-b border-gray-800">
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Investment Amount</span>
          <div className="text-right">
            <span className="text-3xl font-bold text-white">
              {formatCurrency(price)}
            </span>
            {showConverted && (
              <p className="text-xs text-gray-500 mt-1">
                {formatUSD(price)}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Daily Income */}
      <div className="px-6 py-4 border-b border-gray-800">
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Daily Income</span>
          <div className="text-right">
            <span className="text-xl font-semibold text-[#F97316]">
              {formatCurrency(dailyIncome)}
            </span>
            {showConverted && (
              <p className="text-xs text-gray-500">
                {formatUSD(dailyIncome)}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Duration & Total Return */}
      <div className="px-6 py-4 border-b border-gray-800">
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-400">Duration</span>
          <span className="font-semibold text-white">{validityPeriod} days</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Total Return</span>
          <div className="text-right">
            <span className="font-semibold text-[#F97316]">
              {formatCurrency(totalReturn)}
            </span>
            {showConverted && (
              <p className="text-xs text-gray-500">
                {formatUSD(totalReturn)}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ROI */}
      <div className="px-6 py-4 border-b border-gray-800">
        <div className="flex justify-between items-center">
          <span className="text-gray-400">ROI</span>
          <span
            className={`px-3 py-1 rounded-full text-sm font-semibold ${
              roiPercentage > 50
                ? 'bg-[#F97316] bg-opacity-20 text-[#F97316] border border-[#F97316]'
                : 'bg-yellow-500 bg-opacity-20 text-yellow-500 border border-yellow-500'
            }`}
          >
            {roiPercentage.toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Team Commissions */}
      <div className="px-6 py-4 border-b border-gray-800">
        <div className="flex items-center gap-2 mb-3">
          <UsersIcon className="w-4 h-4 text-[#F97316]" />
          <h4 className="text-sm font-semibold text-white">Team Commissions</h4>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Level 1 (10%)</span>
            <div className="text-right">
              <span className="font-medium text-white">{formatCurrency(bCommission)}</span>
              {showConverted && (
                <p className="text-xs text-gray-500">{formatUSD(bCommission)}</p>
              )}
            </div>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Level 2 (6%)</span>
            <div className="text-right">
              <span className="font-medium text-white">{formatCurrency(cCommission)}</span>
              {showConverted && (
                <p className="text-xs text-gray-500">{formatUSD(cCommission)}</p>
              )}
            </div>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Level 3 (3%)</span>
            <div className="text-right">
              <span className="font-medium text-white">{formatCurrency(dCommission)}</span>
              {showConverted && (
                <p className="text-xs text-gray-500">{formatUSD(dCommission)}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-6 py-4 bg-[#030614]">
        <div className="flex gap-3">
          <button
            onClick={() => onViewDetails?.(product)}
            className="flex-1 px-4 py-2 border-2 border-[#F97316] rounded-lg text-[#F97316] hover:bg-[#F97316] hover:text-white transition duration-300 flex items-center justify-center gap-2 font-medium"
          >
            <InformationCircleIcon className="w-5 h-5" />
            Details
          </button>
          <Link
            to={`/product/${product.id}`}
            className="flex-1 px-4 py-2 bg-[#F97316] text-white rounded-lg hover:bg-[#FB923C] transition duration-300 text-center font-medium shadow-lg shadow-[#F97316]/20"
          >
            Invest Now
          </Link>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-[#F97316] to-transparent opacity-5 rounded-bl-full pointer-events-none"></div>
    </motion.div>
  );
};

export default ProductCard;