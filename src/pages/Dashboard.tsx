import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCurrency } from '../contexts/CurrencyContext';
import api from '../services/api';
import type { Investment, InvestmentSummary as InvestmentSummaryType, TeamStats } from '../types';
import InvestmentSummary from '../components/investment/InvestmentSummary';
import Loader from '../components/common/Loader';
import CurrencySelector from '../components/common/CurrencySelector';
import {
  WalletIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowUpTrayIcon,
  ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { ArrowRightIcon } from "@heroicons/react/16/solid";

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { currency, convertAmount, formatAmount, showConverted, setShowConverted } = useCurrency();
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [summary, setSummary] = useState<InvestmentSummaryType | null>(null);
  const [teamStats, setTeamStats] = useState<TeamStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [investmentsData, summaryData, teamStatsData] = await Promise.all([
        api.getInvestments().catch(err => {
          console.error('Error fetching investments:', err);
          return [];
        }),
        api.getInvestmentSummary().catch(err => {
          console.error('Error fetching summary:', err);
          return null;
        }),
        api.getTeamStats().catch(err => {
          console.error('Error fetching team stats:', err);
          return null;
        }),
      ]);

      setInvestments(Array.isArray(investmentsData) ? investmentsData : []);
      setSummary(summaryData);
      setTeamStats(teamStatsData);

      if (!investmentsData && !summaryData && !teamStatsData) {
        setError('Failed to load dashboard data');
      }
    } catch (error) {
      console.error('Dashboard data fetch error:', error);
      setError('Failed to fetch dashboard data');
      toast.error('Failed to fetch dashboard data', {
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

  // Helper function to format amounts based on user preference
    const formatUserAmount = (amountUSD: number): string => {
      // Handle null/undefined/NaN
      if (amountUSD === null || amountUSD === undefined || isNaN(amountUSD)) {
        return showConverted ? `0 ${currency.code}` : '$0';
      }

      // If not showing converted, return USD
      if (!showConverted) {
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(amountUSD);
      }

      // Convert to local currency
      try {
        const targetCurrency = user?.preferred_currency || currency.code;
        const converted = convertAmount(amountUSD, 'USD', targetCurrency as any);
        return formatAmount(converted, targetCurrency as any);
      } catch (error) {
        console.error('Error formatting amount:', error);
        return `0 ${currency.code}`;
      }
    };

  // Get user's balance in appropriate currency
  const getUserBalance = (balanceUSD: number): string => {
    return formatUserAmount(balanceUSD);
  };

  // Format USD amount for display
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
            onClick={fetchDashboardData}
            className="px-4 py-2 bg-[#F97316] text-white rounded-lg hover:bg-[#FB923C] transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const safeInvestments = Array.isArray(investments) ? investments : [];
  const recentInvestments = safeInvestments.slice(0, 5);

  const displayCurrency = showConverted ? (user?.preferred_currency || currency.code) : 'USD';
  const displayFlag = showConverted ? currency.flag : '🇺🇸';

  return (
    <div className="min-h-screen bg-[#0A1929] pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Welcome Section with Currency Controls */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white">
                Welcome back, {user?.first_name || 'Investor'}!
              </h1>
              <p className="text-gray-400 mt-2">
                Here's an overview of your investment portfolio
              </p>
            </div>

            <div className="flex items-center gap-4">
              {/* Display Currency Toggle */}
              <div className="flex items-center bg-[#030614] rounded-lg border-2 border-[#F97316] p-1">
                <button
                  onClick={() => setShowConverted(false)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition flex items-center gap-1 ${
                    !showConverted
                      ? 'bg-[#F97316] text-white'
                      : 'text-gray-400 hover:text-[#F97316]'
                  }`}
                >
                  <span>USD</span>
                </button>
                <button
                  onClick={() => setShowConverted(true)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition flex items-center gap-1 ${
                    showConverted
                      ? 'bg-[#F97316] text-white'
                      : 'text-gray-400 hover:text-[#F97316]'
                  }`}
                >
                  <span>{displayFlag}</span>
                  <span>{user?.preferred_currency || currency.code}</span>
                </button>
              </div>

            </div>
          </div>

          {/* Quick Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Deposit Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-gradient-to-br from-[#0A1929] to-[#0F2744] rounded-2xl shadow-xl overflow-hidden cursor-pointer transform hover:scale-105 transition-all duration-300 border-2 border-[#F97316] border-opacity-50 hover:border-opacity-100"
              onClick={() => window.location.href = '/transactions?action=deposit'}
            >
              <div className="p-6 text-white">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold mb-1">Quick Deposit</h3>
                    <p className="text-gray-400 text-sm">Add funds to your account</p>
                  </div>
                  <div className="bg-[#F97316] bg-opacity-20 p-3 rounded-xl border border-[#F97316]">
                    <ArrowDownTrayIcon className="w-8 h-8 text-[#F97316]" />
                  </div>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <div>
                    <span className="text-2xl font-bold text-[#F97316]">{getUserBalance(user?.available_balance || 0)}</span>
                    {showConverted && (
                      <p className="text-xs text-gray-400 mt-1">
                        ≈ {formatUSD(user?.available_balance || 0)}
                      </p>
                    )}
                  </div>
                  <span className="text-sm bg-[#F97316] bg-opacity-20 px-3 py-1 rounded-full text-[#F97316] border border-[#F97316]">Available</span>
                </div>
                <div className="mt-4 flex items-center text-[#F97316]">
                  <span className="text-sm">Click to deposit now</span>
                  <ArrowRightIcon className="w-4 h-4 ml-2" />
                </div>
              </div>
              <div className="h-2 w-full bg-gradient-to-r from-[#F97316] to-[#FB923C]"></div>
            </motion.div>

            {/* Withdraw Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-gradient-to-br from-[#0A1929] to-[#0F2744] rounded-2xl shadow-xl overflow-hidden cursor-pointer transform hover:scale-105 transition-all duration-300 border-2 border-[#F97316] border-opacity-50 hover:border-opacity-100"
              onClick={() => window.location.href = '/transactions?action=withdraw'}
            >
              <div className="p-6 text-white">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold mb-1">Quick Withdraw</h3>
                    <p className="text-gray-400 text-sm">Withdraw your earnings</p>
                  </div>
                  <div className="bg-[#F97316] bg-opacity-20 p-3 rounded-xl border border-[#F97316]">
                    <ArrowUpTrayIcon className="w-8 h-8 text-[#F97316]" />
                  </div>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <div>
                    <span className="text-2xl font-bold text-[#F97316]">{getUserBalance(user?.available_balance || 0)}</span>
                    {showConverted && (
                      <p className="text-xs text-gray-400 mt-1">
                        ≈ {formatUSD(user?.available_balance || 0)}
                      </p>
                    )}
                  </div>
                  <span className="text-sm bg-[#F97316] bg-opacity-20 px-3 py-1 rounded-full text-[#F97316] border border-[#F97316]">Available</span>
                </div>
                <div className="mt-4 flex items-center text-[#F97316]">
                  <span className="text-sm">Click to withdraw funds</span>
                  <ArrowRightIcon className="w-4 h-4 ml-2" />
                </div>
              </div>
              <div className="h-2 w-full bg-gradient-to-r from-[#F97316] to-[#FB923C]"></div>
            </motion.div>
          </div>

          {/* Quick Stats with Currency Display */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <motion.div
              whileHover={{ y: -5 }}
              className="bg-[#0A1929] rounded-xl shadow-lg p-6 border-2 border-[#F97316] border-opacity-30 hover:border-opacity-100 transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="bg-[#030614] p-3 rounded-lg border border-[#F97316]">
                  <WalletIcon className="w-6 h-6 text-[#F97316]" />
                </div>
                {showConverted && (
                  <span className="text-xs text-gray-400">{currency.flag}</span>
                )}
              </div>
              <p className="text-sm text-gray-400">Available Balance</p>
              <p className="text-2xl font-bold text-white">
                {getUserBalance(user?.available_balance || 0)}
              </p>
              {showConverted && (
                <p className="text-xs text-gray-500 mt-1">
                  {formatUSD(user?.available_balance || 0)}
                </p>
              )}
            </motion.div>

            <motion.div
              whileHover={{ y: -5 }}
              className="bg-[#0A1929] rounded-xl shadow-lg p-6 border-2 border-[#F97316] border-opacity-30 hover:border-opacity-100 transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="bg-[#030614] p-3 rounded-lg border border-[#F97316]">
                  <CurrencyDollarIcon className="w-6 h-6 text-[#F97316]" />
                </div>
                {showConverted && (
                  <span className="text-xs text-gray-400">{currency.flag}</span>
                )}
              </div>
              <p className="text-sm text-gray-400">Total Invested</p>
              <p className="text-2xl font-bold text-white">
                {getUserBalance(user?.total_invested || 0)}
              </p>
              {showConverted && (
                <p className="text-xs text-gray-500 mt-1">
                  {formatUSD(user?.total_invested || 0)}
                </p>
              )}
            </motion.div>

            <motion.div
              whileHover={{ y: -5 }}
              className="bg-[#0A1929] rounded-xl shadow-lg p-6 border-2 border-[#F97316] border-opacity-30 hover:border-opacity-100 transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="bg-[#030614] p-3 rounded-lg border border-[#F97316]">
                  <UserGroupIcon className="w-6 h-6 text-[#F97316]" />
                </div>
              </div>
              <p className="text-sm text-gray-400">Team Size</p>
              <p className="text-2xl font-bold text-white">
                {teamStats?.total_referrals || 0}
              </p>
            </motion.div>

            {/* Add this as a 5th stat card */}
            <motion.div
              whileHover={{ y: -5 }}
              className="bg-[#0A1929] rounded-xl shadow-lg p-6 border-2 border-[#F97316] border-opacity-30 hover:border-opacity-100 transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="bg-[#030614] p-3 rounded-lg border border-[#F97316]">
                  <svg className="w-6 h-6 text-[#F97316]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                {showConverted && <span className="text-xs text-gray-400">{currency.flag}</span>}
              </div>
              <p className="text-sm text-gray-400">Referral Bonuses</p>
              <p className="text-2xl font-bold text-white">
                {formatUserAmount(teamStats?.total_bonus_earned || 0)}
              </p>
              {showConverted && (
                <p className="text-xs text-gray-500 mt-1">
                  {formatUSD(teamStats?.total_bonus_earned || 0)}
                </p>
              )}
              <p className="text-xs text-gray-400 mt-2">
                {teamStats?.bonus_count || 0} sign-ups
              </p>
            </motion.div>
          </div>

          {/* Investment Summary */}
          {summary && (
            <InvestmentSummary
              summary={summary}
              currency={displayCurrency}
              convertAmount={convertAmount}
              formatAmount={formatAmount}
            />
          )}

          {/* Recent Investments */}
          <div className="mt-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Recent Investments</h2>
              <Link
                to="/investments"
                className="text-[#F97316] hover:text-[#FB923C] font-medium transition"
              >
                View All
              </Link>
            </div>

            <div className="bg-[#0A1929] rounded-xl shadow-xl overflow-hidden border-2 border-[#F97316] border-opacity-30">
              {recentInvestments.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-[#030614]">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Product
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Amount ({displayCurrency})
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Daily Income ({displayCurrency})
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Progress
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-[#0A1929] divide-y divide-gray-700">
                      {recentInvestments.map((investment) => (
                        <motion.tr
                          key={investment.id}
                          whileHover={{ backgroundColor: '#0F2744' }}
                          className="transition-colors duration-300"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-white">
                              {investment.product_details?.name || 'Unknown Product'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-white">
                              {formatUserAmount(investment.amount)}
                            </div>
                            {showConverted && (
                              <div className="text-xs text-gray-400">
                                {formatUSD(investment.amount)}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-[#F97316]">
                              {formatUserAmount(investment.daily_income)}
                            </div>
                            {showConverted && (
                              <div className="text-xs text-gray-400">
                                {formatUSD(investment.daily_income)}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="w-full bg-gray-700 rounded-full h-2.5">
                              <div
                                className="bg-[#F97316] h-2.5 rounded-full"
                                style={{ width: `${investment.progress_percentage || 0}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-gray-400 mt-1">
                              {investment.days_remaining || 0} days left
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                                investment.status || 'pending'
                              )}`}
                            >
                              {investment.status || 'pending'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <Link
                              to={`/investments/${investment.id}`}
                              className="text-[#F97316] hover:text-[#FB923C] transition"
                            >
                              View Details
                            </Link>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-400 mb-4">No investments yet</p>
                  <Link
                    to="/products"
                    className="inline-flex items-center px-4 py-2 bg-[#F97316] text-white rounded-lg hover:bg-[#FB923C] transition"
                  >
                    Start Investing
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Team Summary */}
          {teamStats && (
            <div className="mt-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white">Team Summary</h2>
                <Link
                  to="/team"
                  className="text-[#F97316] hover:text-[#FB923C] font-medium transition"
                >
                  View Team
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { level: 1, percent: 10, data: teamStats.level_1_count, volume: teamStats.level_1_volume, commission: teamStats.level_1_commission },
                  { level: 2, percent: 6, data: teamStats.level_2_count, volume: teamStats.level_2_volume, commission: teamStats.level_2_commission },
                  { level: 3, percent: 3, data: teamStats.level_3_count, volume: teamStats.level_3_volume, commission: teamStats.level_3_commission },
                ].map((level, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ y: -5 }}
                    className="bg-[#0A1929] rounded-xl shadow-lg p-6 border-2 border-[#F97316] border-opacity-30 hover:border-opacity-100 transition-all duration-300"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-sm font-medium text-gray-400">Level {level.level} ({level.percent}%)</h3>
                      {showConverted && <span className="text-xs text-gray-400">{currency.flag}</span>}
                    </div>
                    <p className="text-2xl font-bold text-white mb-2">{level.data || 0}</p>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-400">
                        Volume: <span className="text-white ml-1">{formatUserAmount(level.volume || 0)}</span>
                      </p>
                      {showConverted && (
                        <p className="text-xs text-gray-500">
                          {formatUSD(level.volume || 0)}
                        </p>
                      )}
                      <p className="text-sm text-[#F97316]">
                        Commission: {formatUserAmount(level.commission || 0)}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <motion.div
                whileHover={{ y: -5 }}
                className="mt-4 bg-[#0A1929] rounded-xl shadow-lg p-6 border-2 border-[#F97316] border-opacity-30 hover:border-opacity-100 transition-all duration-300"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-400">Pending Commission</p>
                    <p className="text-2xl font-bold text-[#F97316]">
                      {formatUserAmount(teamStats.pending_commission || 0)}
                    </p>
                    {showConverted && (
                      <p className="text-xs text-gray-500">
                        {formatUSD(teamStats.pending_commission || 0)}
                      </p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Total Commission Earned</p>
                    <p className="text-2xl font-bold text-white">
                      {formatUserAmount(teamStats.total_commission_earned || 0)}
                    </p>
                    {showConverted && (
                      <p className="text-xs text-gray-500">
                        {formatUSD(teamStats.total_commission_earned || 0)}
                      </p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Current Level</p>
                    <p className="text-2xl font-bold text-white">
                      Level {teamStats.current_level || 'B'}
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Exchange Rate Info */}
              {showConverted && (
                <div className="mt-4 text-xs text-gray-500 text-right flex items-center justify-end gap-2">
                  <span className="w-1 h-1 bg-[#F97316] rounded-full"></span>
                  All amounts shown in {currency.code} are converted from USD at rate 1 USD = {currency.exchangeRate} {currency.code}
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;