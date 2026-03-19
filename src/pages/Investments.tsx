import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCurrency } from '../contexts/CurrencyContext';
import api from '../services/api';
import Loader from '../components/common/Loader';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import {
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  BanknotesIcon,
  CreditCardIcon,
  PhoneIcon,
  ClockIcon,
  XCircleIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface Investment {
  id: string;
  product_details: {
    name: string;
  };
  amount: number;
  daily_income: number;
  progress_percentage: number;
  days_remaining: number;
  status: string;
  created_at?: string;
  start_date?: string;
  end_date?: string;
}

const Investments: React.FC = () => {
//   const { user } = useAuth();
//   const { currency, convertAmount, formatAmount, showConverted, setShowConverted } = useCurrency();
//   const [searchParams] = useSearchParams();

  const [investments, setInvestments] = useState<Investment[]>([]);
  const [filteredInvestments, setFilteredInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    fetchInvestments();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [investments, filter]);

  const fetchInvestments = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await api.getInvestments();
      console.log('Raw investments response:', data);

      // Ensure data is an array
      const investmentsArray = Array.isArray(data) ? data : [];

      // Parse numeric values
      const parsedInvestments = investmentsArray.map((inv: any) => ({
        ...inv,
        amount: parseNumeric(inv.amount),
        daily_income: parseNumeric(inv.daily_income),
        progress_percentage: parseNumeric(inv.progress_percentage),
        days_remaining: parseNumeric(inv.days_remaining),
      }));

      setInvestments(parsedInvestments);

      if (!Array.isArray(data)) {
        console.warn('Investments response is not an array:', data);
      }
    } catch (error) {
      console.error('Investments fetch error:', error);
      setError('Failed to fetch investments');
      toast.error('Failed to fetch investments', {
        style: {
          background: '#0A1929',
          color: '#F97316',
          border: '1px solid #DC2626',
        },
      });
      setInvestments([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    if (!Array.isArray(investments)) {
      setFilteredInvestments([]);
      return;
    }

    let filtered = [...investments];

    if (filter !== 'all') {
      filtered = filtered.filter(inv => inv.status === filter);
    }

    // Sort by most recent first
    filtered.sort((a, b) => {
      const dateA = a.created_at || a.start_date || '';
      const dateB = b.created_at || b.start_date || '';
      return dateB.localeCompare(dateA);
    });

    setFilteredInvestments(filtered);
  };

  // Format amount based on selected currency preference
  const formatInvestmentAmount = (amountUSD: number): string => {
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

  // Format USD amount for secondary display
  const formatUSD = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500 bg-opacity-20 text-green-500 border border-green-500';
      case 'completed':
        return 'bg-blue-500 bg-opacity-20 text-blue-500 border border-blue-500';
      case 'pending':
        return 'bg-yellow-500 bg-opacity-20 text-yellow-500 border border-yellow-500';
      case 'cancelled':
        return 'bg-red-500 bg-opacity-20 text-red-500 border border-red-500';
      default:
        return 'bg-gray-500 bg-opacity-20 text-gray-500 border border-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A1929] pt-20 flex items-center justify-center">
        <Loader size="large" fullScreen />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0A1929] pt-20 flex items-center justify-center">
        <div className="text-center bg-[#0A1929] p-8 rounded-xl shadow-xl border-2 border-[#F97316]">
          <XCircleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={fetchInvestments}
            className="px-4 py-2 bg-[#F97316] text-white rounded-lg hover:bg-[#FB923C] transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A1929] pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white">My Investments</h1>
              <p className="text-gray-400 mt-2">
                Track and manage your investment portfolio
              </p>
            </div>

            <div className="flex items-center gap-4">
              {/* Display Currency Toggle */}
              <div className="flex items-center bg-[#030614] rounded-lg border-2 border-[#F97316] p-1">
                <button
                  onClick={() => setShowConverted(false)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition ${
                    !showConverted
                      ? 'bg-[#F97316] text-white'
                      : 'text-gray-400 hover:text-[#F97316]'
                  }`}
                >
                  USD
                </button>
                <button
                  onClick={() => setShowConverted(true)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition ${
                    showConverted
                      ? 'bg-[#F97316] text-white'
                      : 'text-gray-400 hover:text-[#F97316]'
                  }`}
                >
                  <span className="flex items-center gap-1">
                    <span>{currency.flag}</span>
                    <span>{currency.code}</span>
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-[#030614] rounded-xl shadow-xl p-4 mb-6 border-2 border-[#F97316] border-opacity-30">
            <div className="flex flex-wrap gap-2">
              {['all', 'active', 'completed', 'pending'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition duration-300 ${
                    filter === status
                      ? 'bg-[#F97316] text-white'
                      : 'bg-[#0A1929] text-gray-400 hover:text-[#F97316] border border-gray-700 hover:border-[#F97316]'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Investments List */}
          <div className="space-y-4">
            {filteredInvestments.length > 0 ? (
              filteredInvestments.map((investment) => (
                <motion.div
                  key={investment.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-[#0A1929] rounded-xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-[#F97316]"
                >
                  <div className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                      {/* Product Info */}
                      <div className="flex items-center space-x-4 mb-4 lg:mb-0">
                        <div className="w-12 h-12 bg-gradient-to-r from-[#F97316] to-[#FB923C] rounded-lg flex items-center justify-center">
                          <span className="text-white font-bold text-lg">
                            {investment.product_details?.name?.charAt(0) || '?'}
                          </span>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white">
                            {investment.product_details?.name || 'Unknown Product'}
                          </h3>
                          <p className="text-sm text-gray-400">
                            {investment.start_date ? new Date(investment.start_date).toLocaleDateString() : ''}
                          </p>
                        </div>
                      </div>

                      {/* Status */}
                      <div className="mb-4 lg:mb-0">
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(investment.status)}`}>
                          {investment.status?.charAt(0).toUpperCase() + investment.status?.slice(1) || 'Unknown'}
                        </span>
                      </div>

                      {/* Amount with Currency Support */}
                      <div className="grid grid-cols-2 gap-4 lg:gap-8">
                        <div>
                          <p className="text-sm text-gray-400">Invested</p>
                          <div>
                            <p className="text-lg font-bold text-white">
                              {formatInvestmentAmount(investment.amount)}
                            </p>
                            {showConverted && (
                              <p className="text-xs text-gray-500">
                                {formatUSD(investment.amount)}
                              </p>
                            )}
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Daily Income</p>
                          <div>
                            <p className="text-lg font-bold text-[#F97316]">
                              {formatInvestmentAmount(investment.daily_income)}
                            </p>
                            {showConverted && (
                              <p className="text-xs text-gray-500">
                                {formatUSD(investment.daily_income)}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    {investment.status === 'active' && (
                      <div className="mt-4">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-400">Progress</span>
                          <span className="text-white font-medium">
                            {investment.progress_percentage?.toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2.5">
                          <div
                            className="bg-[#F97316] h-2.5 rounded-full"
                            style={{ width: `${investment.progress_percentage || 0}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-400 mt-2">
                          <ClockIcon className="w-4 h-4 inline mr-1" />
                          {investment.days_remaining || 0} days remaining
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16 bg-[#0A1929] rounded-xl border-2 border-[#F97316] border-opacity-30"
              >
                <DocumentTextIcon className="w-16 h-16 mx-auto text-gray-500 mb-4" />
                <p className="text-gray-400 mb-6">No investments found</p>
                <Link
                  to="/products"
                  className="inline-flex items-center px-6 py-3 bg-[#F97316] text-white rounded-lg hover:bg-[#FB923C] transition shadow-lg shadow-[#F97316]/20"
                >
                  Browse Products
                </Link>
              </motion.div>
            )}
          </div>

          {/* Exchange Rate Info */}
          {showConverted && filteredInvestments.length > 0 && (
            <div className="mt-6 text-center text-sm text-gray-500">
              <p className="flex items-center justify-center gap-2">
                <span className="w-1 h-1 bg-[#F97316] rounded-full"></span>
                Amounts shown in {currency.code} are converted from USD at rate 1 USD = {currency.exchangeRate} {currency.code}
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Investments;