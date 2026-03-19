import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useCurrency } from '../contexts/CurrencyContext';
import api from '../services/api';
import type { TeamStats, TeamMember, TeamCommission } from '../types';
import Loader from '../components/common/Loader';
import CurrencySelector from '../components/common/CurrencySelector';
import {
  UserGroupIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  UserIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
// import { CheckIcon } from '@heroicons/react/20/solid';
import toast from 'react-hot-toast';

const Team: React.FC = () => {
  const { user } = useAuth();
  const { currency, convertAmount, formatAmount, showConverted } = useCurrency();
  const [stats, setStats] = useState<TeamStats | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [commissions, setCommissions] = useState<TeamCommission[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'commissions'>('overview');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [error, setError] = useState<string | null>(null);
//   const [recalculating, setRecalculating] = useState(false);

  useEffect(() => {
    fetchTeamData();
  }, []);

  const fetchTeamData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [statsData, membersData, commissionsData] = await Promise.all([
        api.getTeamStats().catch(err => {
          console.error('Error fetching team stats:', err);
          return null;
        }),
        api.getTeamMembers().catch(err => {
          console.error('Error fetching team members:', err);
          return [];
        }),
        api.getTeamCommissions().catch(err => {
          console.error('Error fetching commissions:', err);
          return [];
        }),
      ]);

      setStats(statsData);
      setTeamMembers(Array.isArray(membersData) ? membersData : []);
      setCommissions(Array.isArray(commissionsData) ? commissionsData : []);

      if (!statsData && !membersData && !commissionsData) {
        setError('Failed to load team data');
      }
    } catch (error) {
      console.error('Team data fetch error:', error);
      setError('Failed to fetch team data');
      toast.error('Failed to fetch team data', {
        style: {
          background: '#0A1929',
          color: '#F97316',
          border: '1px solid #DC2626',
        },
      });
      setTeamMembers([]);
      setCommissions([]);
    } finally {
      setLoading(false);
    }
  };

//     const handleRecalculate = async () => {
//       setRecalculating(true);
//       try {
//         const newStats = await api.recalculateTeamStats();
//         setStats(newStats);
//         toast.success('Team stats recalculated successfully!', {
//           style: {
//             background: '#0A1929',
//             color: '#F97316',
//             border: '1px solid #F97316',
//           },
//         });
//       } catch (error) {
//         toast.error('Failed to recalculate stats');
//       } finally {
//         setRecalculating(false);
//       }
//     };

  // Format amount based on selected currency preference
    const formatTeamAmount = (amountUSD: number): string => {
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
        const converted = convertAmount(amountUSD, 'USD', currency.code);
        return formatAmount(converted, currency.code);
      } catch (error) {
        console.error('Error formatting amount:', error);
        return `0 ${currency.code}`;
      }
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

  const getLevelColor = (level: number) => {
    switch (level) {
      case 1:
        return 'bg-green-500 bg-opacity-20 text-green-500 border border-green-500';
      case 2:
        return 'bg-blue-500 bg-opacity-20 text-blue-500 border border-blue-500';
      case 3:
        return 'bg-purple-500 bg-opacity-20 text-purple-500 border border-purple-500';
      default:
        return 'bg-gray-500 bg-opacity-20 text-gray-500 border border-gray-500';
    }
  };

  // Safely filter members
  const safeTeamMembers = Array.isArray(teamMembers) ? teamMembers : [];
  const filteredMembers = safeTeamMembers.filter(member => {
    if (levelFilter === 'all') return true;
    return member.depth === parseInt(levelFilter);
  });

  // Safely get commissions
  const safeCommissions = Array.isArray(commissions) ? commissions : [];

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
            onClick={fetchTeamData}
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
          {/* Header with Currency Controls */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white">My Team</h1>
              <p className="text-gray-400 mt-2">
                Track your team performance and commissions
              </p>
            </div>

            <div className="flex items-center gap-4">
              {/* Display Currency Toggle */}


              {/* Currency Selector */}
              <CurrencySelector />
            </div>
          </div>

          {/* Referral Link */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-[#0A1929] to-[#0F2744] rounded-xl shadow-xl p-6 mb-8 border-2 border-[#F97316]"
          >
            <h2 className="text-lg font-semibold text-white mb-2">Your Referral Link</h2>
            <p className="text-sm text-gray-400 mb-3">
              Share this link with friends to earn commissions
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={user?.referral_link || ''}
                readOnly
                className="flex-1 px-4 py-3 bg-[#030614] rounded-lg text-white border-2 border-[#F97316] focus:outline-none"
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(user?.referral_link || '');
                  toast.success('Link copied to clipboard!', {
                    style: {
                      background: '#0A1929',
                      color: '#F97316',
                      border: '1px solid #F97316',
                    },
                  });
                }}
                className="px-6 py-3 bg-[#F97316] text-white rounded-lg font-semibold hover:bg-[#FB923C] transition shadow-lg shadow-[#F97316]/20"
              >
                Copy
              </button>
            </div>
          </motion.div>

          {/* Stats Cards with Currency Support */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
              <motion.div
                whileHover={{ y: -5 }}
                className="bg-[#0A1929] rounded-xl shadow-xl p-6 border-2 border-[#F97316] border-opacity-30 hover:border-opacity-100 transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="bg-[#030614] p-3 rounded-lg border border-[#F97316]">
                    <UserGroupIcon className="w-6 h-6 text-[#F97316]" />
                  </div>
                </div>
                <p className="text-sm text-gray-400">Total Team Members</p>
                <p className="text-2xl font-bold text-white">{stats.total_referrals || 0}</p>
                <div className="flex gap-2 mt-2">
                  <span className="px-2 py-1 text-xs bg-green-500 bg-opacity-20 text-green-500 rounded-full border border-green-500">
                    L1: {stats.level_1_count || 0}
                  </span>
                  <span className="px-2 py-1 text-xs bg-blue-500 bg-opacity-20 text-blue-500 rounded-full border border-blue-500">
                    L2: {stats.level_2_count || 0}
                  </span>
                  <span className="px-2 py-1 text-xs bg-purple-500 bg-opacity-20 text-purple-500 rounded-full border border-purple-500">
                    L3: {stats.level_3_count || 0}
                  </span>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ y: -5 }}
                className="bg-[#0A1929] rounded-xl shadow-xl p-6 border-2 border-[#F97316] border-opacity-30 hover:border-opacity-100 transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="bg-[#030614] p-3 rounded-lg border border-[#F97316]">
                    <CurrencyDollarIcon className="w-6 h-6 text-[#F97316]" />
                  </div>
                  {showConverted && <span className="text-xs text-gray-400">{currency.flag}</span>}
                </div>
                <p className="text-sm text-gray-400">Team Volume</p>
                <div>
                  <p className="text-2xl font-bold text-white">
                    {formatTeamAmount(stats.team_volume || 0)}
                  </p>
                  {showConverted && (
                    <p className="text-xs text-gray-500 mt-1">
                      {formatUSD(stats.team_volume || 0)}
                    </p>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  Personal: {formatTeamAmount(stats.personal_volume || 0)}
                </p>
              </motion.div>

              <motion.div
                whileHover={{ y: -5 }}
                className="bg-[#0A1929] rounded-xl shadow-xl p-6 border-2 border-[#F97316] border-opacity-30 hover:border-opacity-100 transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="bg-[#030614] p-3 rounded-lg border border-[#F97316]">
                    <ArrowTrendingUpIcon className="w-6 h-6 text-[#F97316]" />
                  </div>
                  {showConverted && <span className="text-xs text-gray-400">{currency.flag}</span>}
                </div>
                <p className="text-sm text-gray-400">Total Commission</p>
                <div>
                  <p className="text-2xl font-bold text-white">
                    {formatTeamAmount(stats.total_commission_earned || 0)}
                  </p>
                  {showConverted && (
                    <p className="text-xs text-gray-500 mt-1">
                      {formatUSD(stats.total_commission_earned || 0)}
                    </p>
                  )}
                </div>
                <p className="text-xs text-[#F97316] mt-2">
                  Pending: {formatTeamAmount(stats.pending_commission || 0)}
                </p>
              </motion.div>

              <motion.div
                whileHover={{ y: -5 }}
                className="bg-[#0A1929] rounded-xl shadow-xl p-6 border-2 border-[#F97316] border-opacity-30 hover:border-opacity-100 transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="bg-[#030614] p-3 rounded-lg border border-[#F97316]">
                    <UserIcon className="w-6 h-6 text-[#F97316]" />
                  </div>
                </div>
                <p className="text-sm text-gray-400">Current Level</p>
                <p className="text-2xl font-bold text-white">Level {stats.current_level || 'B'}</p>
                <p className="text-xs text-gray-400 mt-2">
                  {stats.level_1_count || 0}/10 to reach next level
                </p>
              </motion.div>

              <motion.div
              whileHover={{ y: -5 }}
              className="bg-[#0A1929] rounded-xl shadow-xl p-6 border-2 border-[#F97316] border-opacity-30 hover:border-opacity-100 transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="bg-[#030614] p-3 rounded-lg border border-[#F97316]">
                  <svg className="w-6 h-6 text-[#F97316]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                {showConverted && <span className="text-xs text-gray-400">{currency.flag}</span>}
              </div>
              <p className="text-sm text-gray-400">Sign-up Bonuses</p>
              <div>
                <p className="text-2xl font-bold text-white">
                  {formatTeamAmount(stats.total_bonus_earned || 0)}
                </p>
                {showConverted && (
                  <p className="text-xs text-gray-500 mt-1">
                    {formatUSD(stats.total_bonus_earned || 0)}
                  </p>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-2">
                {stats.bonus_count || 0} referrals • $1 each
              </p>
        </motion.div>
            </div>
          )}


          {/* Tabs */}
          <div className="border-b border-gray-700 mb-6">
            <nav className="flex space-x-8">
              {(['overview', 'members', 'commissions'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm capitalize transition ${
                    activeTab === tab
                      ? 'border-[#F97316] text-[#F97316]'
                      : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && stats && (
            <div className="space-y-6">
              {/* Level Breakdown */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-[#0A1929] rounded-xl shadow-xl p-6 border-2 border-[#F97316] border-opacity-30"
              >
                <h3 className="text-lg font-semibold text-white mb-4">Level Breakdown</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-[#030614] rounded-lg border-l-4 border-green-500">
                    <div>
                      <h4 className="font-medium text-green-500">Level 1 (10%)</h4>
                      <p className="text-sm text-gray-400">
                        {stats.level_1_count || 0} members • {formatTeamAmount(stats.level_1_volume || 0)} volume
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-white">
                        {formatTeamAmount(stats.level_1_commission || 0)}
                      </p>
                      {showConverted && (
                        <p className="text-xs text-gray-500">
                          {formatUSD(stats.level_1_commission || 0)}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-[#030614] rounded-lg border-l-4 border-blue-500">
                    <div>
                      <h4 className="font-medium text-blue-500">Level 2 (6%)</h4>
                      <p className="text-sm text-gray-400">
                        {stats.level_2_count || 0} members • {formatTeamAmount(stats.level_2_volume || 0)} volume
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-white">
                        {formatTeamAmount(stats.level_2_commission || 0)}
                      </p>
                      {showConverted && (
                        <p className="text-xs text-gray-500">
                          {formatUSD(stats.level_2_commission || 0)}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-[#030614] rounded-lg border-l-4 border-purple-500">
                    <div>
                      <h4 className="font-medium text-purple-500">Level 3 (3%)</h4>
                      <p className="text-sm text-gray-400">
                        {stats.level_3_count || 0} members • {formatTeamAmount(stats.level_3_volume || 0)} volume
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-white">
                        {formatTeamAmount(stats.level_3_commission || 0)}
                      </p>
                      {showConverted && (
                        <p className="text-xs text-gray-500">
                          {formatUSD(stats.level_3_commission || 0)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Next Level Requirements */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="bg-[#0A1929] rounded-xl shadow-xl p-6 border-2 border-[#F97316] border-opacity-30"
              >
                <h3 className="text-lg font-semibold text-white mb-4">Next Level Requirements</h3>
                {stats.current_level === 'B' && (
                  <div>
                    <p className="text-sm text-gray-400 mb-3">
                      To reach Level C, you need:
                    </p>
                    <ul className="space-y-3">
                      <li className="flex items-center">
                        <CheckCircleIcon className={`w-5 h-5 mr-3 ${
                          (stats.level_1_count || 0) >= 10 ? 'text-green-500' : 'text-gray-600'
                        }`} />
                        <span className="text-sm text-gray-300">
                          10 Direct Referrals ({stats.level_1_count || 0}/10)
                        </span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircleIcon className={`w-5 h-5 mr-3 ${
                          (stats.level_1_volume || 0) >= 50000 ? 'text-green-500' : 'text-gray-600'
                        }`} />
                        <span className="text-sm text-gray-300">
                          {formatTeamAmount(50000)} Team Volume ({formatTeamAmount(stats.level_1_volume || 0)})
                        </span>
                      </li>
                    </ul>
                  </div>
                )}
                {stats.current_level === 'C' && (
                  <div>
                    <p className="text-sm text-gray-400 mb-3">
                      To reach Level D, you need:
                    </p>
                    <ul className="space-y-3">
                      <li className="flex items-center">
                        <CheckCircleIcon className={`w-5 h-5 mr-3 ${
                          (stats.level_1_count || 0) >= 20 ? 'text-green-500' : 'text-gray-600'
                        }`} />
                        <span className="text-sm text-gray-300">
                          20 Direct Referrals ({stats.level_1_count || 0}/20)
                        </span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircleIcon className={`w-5 h-5 mr-3 ${
                          (stats.level_1_volume || 0) >= 100000 ? 'text-green-500' : 'text-gray-600'
                        }`} />
                        <span className="text-sm text-gray-300">
                          {formatTeamAmount(100000)} Team Volume ({formatTeamAmount(stats.level_1_volume || 0)})
                        </span>
                      </li>
                    </ul>
                  </div>
                )}
                {stats.current_level === 'D' && (
                  <p className="text-green-500">You've reached the highest level!</p>
                )}
              </motion.div>

              {/* Exchange Rate Info */}
              {showConverted && (
                <div className="text-sm text-gray-500 text-right flex items-center justify-end gap-2">
                  <span className="w-1 h-1 bg-[#F97316] rounded-full"></span>
                  All amounts shown in {currency.code} are converted from USD at rate 1 USD = {currency.exchangeRate} {currency.code}
                </div>
              )}
            </div>
          )}

          {activeTab === 'members' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-[#0A1929] rounded-xl shadow-xl overflow-hidden border-2 border-[#F97316] border-opacity-30"
            >
              <div className="p-4 border-b border-gray-700 bg-[#030614]">
                <select
                  value={levelFilter}
                  onChange={(e) => setLevelFilter(e.target.value)}
                  className="px-3 py-2 bg-[#0A1929] border-2 border-[#F97316] text-white rounded-lg focus:ring-2 focus:ring-[#F97316] focus:border-transparent"
                >
                  <option value="all" className="bg-[#0A1929]">All Levels</option>
                  <option value="1" className="bg-[#0A1929]">Level 1 (10%)</option>
                  <option value="2" className="bg-[#0A1929]">Level 2 (6%)</option>
                  <option value="3" className="bg-[#0A1929]">Level 3 (3%)</option>
                </select>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead className="bg-[#030614]">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Member
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Level
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Joined
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Total Invested ({showConverted ? currency.code : 'USD'})
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-[#0A1929] divide-y divide-gray-700">
                    {filteredMembers.length > 0 ? (
                      filteredMembers.map((member) => (
                        <motion.tr
                          key={member.id}
                          whileHover={{ backgroundColor: '#0F2744' }}
                          className="transition-colors duration-300"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 bg-[#030614] rounded-full flex items-center justify-center border border-[#F97316]">
                                <span className="text-[#F97316] font-medium">
                                  {member.first_name?.[0] || member.username?.[0] || '?'}
                                </span>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-white">
                                  {member.first_name} {member.last_name}
                                </div>
                                <div className="text-sm text-gray-400">{member.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getLevelColor(member.depth)}`}>
                              Level {member.depth} ({member.depth === 1 ? '10%' : member.depth === 2 ? '6%' : '3%'})
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                            {member.joined_at ? new Date(member.joined_at).toLocaleDateString() : 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-white">
                              {formatTeamAmount(member.total_invested || 0)}
                            </div>
                            {showConverted && (
                              <div className="text-xs text-gray-500">
                                {formatUSD(member.total_invested || 0)}
                              </div>
                            )}
                          </td>
                        </motion.tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center text-gray-400">
                          No team members found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {activeTab === 'commissions' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-[#0A1929] rounded-xl shadow-xl overflow-hidden border-2 border-[#F97316] border-opacity-30"
            >
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead className="bg-[#030614]">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        From
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Level
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Amount ({showConverted ? currency.code : 'USD'})
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-[#0A1929] divide-y divide-gray-700">
                    {safeCommissions.length > 0 ? (
                      safeCommissions.map((commission) => (
                        <motion.tr
                          key={commission.id}
                          whileHover={{ backgroundColor: '#0F2744' }}
                          className="transition-colors duration-300"
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                            {commission.created_at ? new Date(commission.created_at).toLocaleDateString() : 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-white">
                              {commission.from_user_details?.first_name} {commission.from_user_details?.last_name}
                            </div>
                            <div className="text-sm text-gray-400">
                              {commission.from_user_details?.email}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              commission.level === 'B' ? 'bg-green-500 bg-opacity-20 text-green-500 border border-green-500' :
                              commission.level === 'C' ? 'bg-blue-500 bg-opacity-20 text-blue-500 border border-blue-500' :
                              'bg-purple-500 bg-opacity-20 text-purple-500 border border-purple-500'
                            }`}>
                              Level {commission.level} ({commission.percentage || 0}%)
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-[#F97316]">
                              {formatTeamAmount(commission.amount || 0)}
                            </div>
                            {showConverted && (
                              <div className="text-xs text-gray-500">
                                {formatUSD(commission.amount || 0)}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${
                              commission.status === 'paid' ? 'bg-green-500 bg-opacity-20 text-green-500 border-green-500' :
                              commission.status === 'pending' ? 'bg-yellow-500 bg-opacity-20 text-yellow-500 border-yellow-500' :
                              'bg-red-500 bg-opacity-20 text-red-500 border-red-500'
                            }`}>
                              {commission.status === 'paid' && <CheckCircleIcon className="w-3 h-3 mr-1" />}
                              {commission.status === 'pending' && <ClockIcon className="w-3 h-3 mr-1" />}
                              {commission.status === 'cancelled' && <XCircleIcon className="w-3 h-3 mr-1" />}
                              {commission.status || 'pending'}
                            </span>
                          </td>
                        </motion.tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                          No commissions yet
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Team;