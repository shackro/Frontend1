import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCurrency } from '../contexts/CurrencyContext';
import api from '../services/api';
import Loader from '../components/common/Loader';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import CurrencySelector from '../components/common/CurrencySelector';
import {
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  BanknotesIcon,
  CreditCardIcon,
  PhoneIcon,
  CurrencyDollarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  DocumentTextIcon,
  FunnelIcon,
  ArrowPathIcon,
  PrinterIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface Transaction {
  id: string;
  transaction_type: 'deposit' | 'withdrawal';
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  payment_method: string;
  reference: string;
  requested_at: string;
  processed_at: string | null;
  completed_at: string | null;
  bank_name?: string;
  account_number?: string;
  account_name?: string;
  mpesa_phone?: string;
  mpesa_receipt?: string;
  admin_notes?: string;
}

const Transactions: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { currency, convertAmount, formatAmount, showConverted } = useCurrency();
  const [searchParams] = useSearchParams();

  // Minimum deposit amounts
  const MIN_DEPOSIT_USD = 3.50;
  const MIN_DEPOSIT_KES = 450;
  const MIN_DEPOSIT_EUR = 3.20;

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<{start: string; end: string}>({
    start: '',
    end: ''
  });
  const [summary, setSummary] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Form states - now storing amount in USD internally
  const [depositAmountUSD, setDepositAmountUSD] = useState<number>(0);
  const [depositAmountDisplay, setDepositAmountDisplay] = useState<string>('');
  const [withdrawAmountUSD, setWithdrawAmountUSD] = useState<number>(0);
  const [withdrawAmountDisplay, setWithdrawAmountDisplay] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState('bank_transfer');
  const [bankDetails, setBankDetails] = useState({
    bankName: '',
    accountNumber: '',
    accountName: '',
    swiftCode: '',
  });
  const [mpesaPhone, setMpesaPhone] = useState('');
  const [cryptoAddress, setCryptoAddress] = useState('');

  useEffect(() => {
    const action = searchParams.get('action');
    if (action === 'deposit') {
      setShowDepositModal(true);
    } else if (action === 'withdraw') {
      setShowWithdrawModal(true);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchTransactions();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [transactions, filter, dateRange]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError(null);

      const [transactionsData, summaryData] = await Promise.all([
        api.getTransactions().catch(err => {
          console.error('Error fetching transactions:', err);
          return [];
        }),
        api.getTransactionSummary().catch(err => {
          console.error('Error fetching summary:', err);
          return null;
        }),
      ]);

      setTransactions(Array.isArray(transactionsData) ? transactionsData : []);
      setSummary(summaryData);

      if (!transactionsData && !summaryData) {
        setError('Failed to load transaction data');
      }
    } catch (error) {
      console.error('Transactions fetch error:', error);
      setError('Failed to fetch transactions');
      toast.error('Failed to fetch transactions', {
        style: {
          background: '#0A1929',
          color: '#F97316',
          border: '1px solid #DC2626',
        },
      });
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...transactions];

    if (filter !== 'all') {
      filtered = filtered.filter(t => t.transaction_type === filter);
    }

    if (dateRange.start) {
      filtered = filtered.filter(t => new Date(t.requested_at) >= new Date(dateRange.start));
    }
    if (dateRange.end) {
      filtered = filtered.filter(t => new Date(t.requested_at) <= new Date(dateRange.end));
    }

    filtered.sort((a, b) => new Date(b.requested_at).getTime() - new Date(a.requested_at).getTime());

    setFilteredTransactions(filtered);
  };

  const resetFilters = () => {
    setFilter('all');
    setDateRange({ start: '', end: '' });
  };

  // Handle deposit amount change with currency conversion
  const handleDepositAmountChange = (value: string) => {
    setDepositAmountDisplay(value);
    if (value === '') {
      setDepositAmountUSD(0);
      return;
    }

    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      if (showConverted) {
        // Convert from displayed currency to USD
        const usdValue = numValue / currency.exchangeRate;
        setDepositAmountUSD(usdValue);
      } else {
        // Already in USD
        setDepositAmountUSD(numValue);
      }
    }
  };

  // Handle withdrawal amount change with currency conversion
  const handleWithdrawAmountChange = (value: string) => {
    setWithdrawAmountDisplay(value);
    if (value === '') {
      setWithdrawAmountUSD(0);
      return;
    }

    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      if (showConverted) {
        // Convert from displayed currency to USD
        const usdValue = numValue / currency.exchangeRate;
        setWithdrawAmountUSD(usdValue);
      } else {
        // Already in USD
        setWithdrawAmountUSD(numValue);
      }
    }
  };

  // Get display amount based on USD value
//   const getDisplayAmount = (usdAmount: number): string => {
//     if (!showConverted) {
//       return usdAmount.toString();
//     }
//     const converted = usdAmount * currency.exchangeRate;
//     return converted.toFixed(2);
//   };

  // Format amount for display in the current currency
  const formatDisplayAmount = (amountUSD: number): string => {
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

  // Get the equivalent amount in selected currency for preview
  const getConvertedPreview = (amountUSD: number): string => {
    if (!amountUSD) return '';
    const converted = convertAmount(amountUSD, 'USD', currency.code);
    return formatAmount(converted, currency.code);
  };

  const handleDeposit = async () => {
    if (depositAmountUSD <= 0) {
      toast.error('Please enter a valid amount', {
        style: {
          background: '#0A1929',
          color: '#F97316',
          border: '1px solid #DC2626',
        },
      });
      return;
    }

    // Check minimum deposit based on selected currency
    let minDeposit = MIN_DEPOSIT_USD;
    let minDepositMessage = `Minimum deposit is $${MIN_DEPOSIT_USD} USD`;

    if (showConverted) {
      if (currency.code === 'KES') {
        minDeposit = MIN_DEPOSIT_KES / currency.exchangeRate;
        minDepositMessage = `Minimum deposit is ${MIN_DEPOSIT_KES} KES`;
      } else if (currency.code === 'EUR') {
        minDeposit = MIN_DEPOSIT_EUR / currency.exchangeRate;
        minDepositMessage = `Minimum deposit is ${MIN_DEPOSIT_EUR} EUR`;
      }
    }

    if (depositAmountUSD < minDeposit) {
      toast.error(minDepositMessage, {
        style: {
          background: '#0A1929',
          color: '#F97316',
          border: '1px solid #DC2626',
        },
      });
      return;
    }

    setActionLoading(true);
    try {
      const data: any = {
        amount: Number(depositAmountUSD.toFixed(2)),
        currency: 'USD',
        payment_method: paymentMethod,
      };

      if (paymentMethod === 'bank_transfer') {
        if (!bankDetails.bankName || !bankDetails.accountNumber || !bankDetails.accountName) {
          toast.error('Please fill in all bank details', {
            style: {
              background: '#0A1929',
              color: '#F97316',
              border: '1px solid #DC2626',
            },
          });
          setActionLoading(false);
          return;
        }
        data.bank_name = bankDetails.bankName;
        data.account_number = bankDetails.accountNumber;
        data.account_name = bankDetails.accountName;
        data.swift_code = bankDetails.swiftCode;
      } else if (paymentMethod === 'mpesa') {
        if (!mpesaPhone) {
          toast.error('Please enter your M-Pesa phone number', {
            style: {
              background: '#0A1929',
              color: '#F97316',
              border: '1px solid #DC2626',
            },
          });
          setActionLoading(false);
          return;
        }
        data.mpesa_phone = mpesaPhone;
      } else if (paymentMethod === 'crypto') {
        if (!cryptoAddress) {
          toast.error('Please enter your crypto address', {
            style: {
              background: '#0A1929',
              color: '#F97316',
              border: '1px solid #DC2626',
            },
          });
          setActionLoading(false);
          return;
        }
        data.crypto_address = cryptoAddress;
      }

      const response = await api.createDeposit(data);

      // Update local user balance
      if (user) {
        const updatedUser = {
          ...user,
          balance: (user.balance || 0) + depositAmountUSD,
          available_balance: (user.available_balance || 0) + depositAmountUSD
        };
        updateUser(updatedUser);
      }

      toast.success('Deposit completed successfully! Your balance has been updated.', {
        style: {
          background: '#0A1929',
          color: '#F97316',
          border: '1px solid #F97316',
        },
      });
      setShowDepositModal(false);
      resetForms();
      await fetchTransactions();

      toast.success(
        <div>
          <p className="font-bold text-[#F97316]">Transaction Reference:</p>
          <p className="text-sm font-mono text-white bg-[#030614] p-2 rounded mt-1">{response.reference}</p>
        </div>,
        {
          style: {
            background: '#0A1929',
            border: '1px solid #F97316',
          },
          duration: 6000
        }
      );
    } catch (error: any) {
      console.error('Deposit error:', error);
      toast.error(error.message || 'Failed to submit deposit request', {
        style: {
          background: '#0A1929',
          color: '#F97316',
          border: '1px solid #DC2626',
        },
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (withdrawAmountUSD <= 0) {
      toast.error('Please enter a valid amount', {
        style: {
          background: '#0A1929',
          color: '#F97316',
          border: '1px solid #DC2626',
        },
      });
      return;
    }

    if (withdrawAmountUSD > (user?.available_balance || 0)) {
      toast.error('Insufficient balance', {
        style: {
          background: '#0A1929',
          color: '#F97316',
          border: '1px solid #DC2626',
        },
      });
      return;
    }

    setActionLoading(true);
    try {
      const data: any = {
        amount: Number(withdrawAmountUSD.toFixed(2)),
        currency: 'USD',
        payment_method: paymentMethod,
      };

      if (paymentMethod === 'bank_transfer') {
        if (!bankDetails.bankName || !bankDetails.accountNumber || !bankDetails.accountName) {
          toast.error('Please fill in all bank details', {
            style: {
              background: '#0A1929',
              color: '#F97316',
              border: '1px solid #DC2626',
            },
          });
          setActionLoading(false);
          return;
        }
        data.bank_name = bankDetails.bankName;
        data.account_number = bankDetails.accountNumber;
        data.account_name = bankDetails.accountName;
        data.swift_code = bankDetails.swiftCode;
      } else if (paymentMethod === 'mpesa') {
        if (!mpesaPhone) {
          toast.error('Please enter your M-Pesa phone number', {
            style: {
              background: '#0A1929',
              color: '#F97316',
              border: '1px solid #DC2626',
            },
          });
          setActionLoading(false);
          return;
        }
        data.mpesa_phone = mpesaPhone;
      }

      const response = await api.createWithdrawal(data);

      // Update local user balance (deduct immediately)
      if (user) {
        const updatedUser = {
          ...user,
          balance: (user.balance || 0) - withdrawAmountUSD,
          available_balance: (user.available_balance || 0) - withdrawAmountUSD
        };
        updateUser(updatedUser);
      }

      toast.success('Withdrawal request submitted successfully! It will be processed within 24-48 hours.', {
        style: {
          background: '#0A1929',
          color: '#F97316',
          border: '1px solid #F97316',
        },
      });
      setShowWithdrawModal(false);
      resetForms();
      await fetchTransactions();

      toast.success(
        <div>
          <p className="font-bold text-[#F97316]">Request Reference:</p>
          <p className="text-sm font-mono text-white bg-[#030614] p-2 rounded mt-1">{response.reference}</p>
          <p className="text-xs text-[#F97316] mt-1">Status: Pending Approval</p>
        </div>,
        {
          style: {
            background: '#0A1929',
            border: '1px solid #F97316',
          },
          duration: 6000
        }
      );
    } catch (error: any) {
      console.error('Withdrawal error:', error);
      toast.error(error.response?.data?.message || 'Failed to submit withdrawal request', {
        style: {
          background: '#0A1929',
          color: '#F97316',
          border: '1px solid #DC2626',
        },
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelTransaction = async (transactionId: string) => {
    if (!window.confirm('Are you sure you want to cancel this transaction? This action cannot be undone.')) {
      return;
    }

    setActionLoading(true);
    try {
      await api.cancelTransaction(transactionId);
      toast.success('Transaction cancelled successfully', {
        style: {
          background: '#0A1929',
          color: '#F97316',
          border: '1px solid #F97316',
        },
      });
      setSelectedTransaction(null);
      fetchTransactions();
    } catch (error: any) {
      console.error('Cancel error:', error);
      toast.error(error.response?.data?.message || 'Failed to cancel transaction', {
        style: {
          background: '#0A1929',
          color: '#F97316',
          border: '1px solid #DC2626',
        },
      });
    } finally {
      setActionLoading(false);
    }
  };

  const resetForms = () => {
    setDepositAmountDisplay('');
    setDepositAmountUSD(0);
    setWithdrawAmountDisplay('');
    setWithdrawAmountUSD(0);
    setPaymentMethod('bank_transfer');
    setBankDetails({ bankName: '', accountNumber: '', accountName: '', swiftCode: '' });
    setMpesaPhone('');
    setCryptoAddress('');
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      completed: 'bg-green-500 bg-opacity-20 text-green-500 border border-green-500',
      pending: 'bg-yellow-500 bg-opacity-20 text-yellow-500 border border-yellow-500',
      processing: 'bg-blue-500 bg-opacity-20 text-blue-500 border border-blue-500',
      failed: 'bg-red-500 bg-opacity-20 text-red-500 border border-red-500',
      cancelled: 'bg-gray-500 bg-opacity-20 text-gray-500 border border-gray-500',
    };
    return styles[status] || styles.pending;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="w-4 h-4" />;
      case 'pending':
      case 'processing':
        return <ClockIcon className="w-4 h-4" />;
      case 'failed':
      case 'cancelled':
        return <XCircleIcon className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getStatusDescription = (status: string, type: string) => {
    switch (status) {
      case 'completed':
        return type === 'deposit' ? 'Funds added to your wallet' : 'Funds sent to your account';
      case 'pending':
        return type === 'deposit' ? 'Processing deposit' : 'Awaiting admin approval';
      case 'processing':
        return 'Being processed';
      case 'failed':
        return 'Transaction failed';
      case 'cancelled':
        return 'Cancelled by user';
      default:
        return '';
    }
  };

  const exportToCSV = () => {
    const headers = ['Reference', 'Type', 'Amount (USD)', 'Amount (Local)', 'Method', 'Status', 'Date', 'Description'];
    const csvData = filteredTransactions.map(t => [
      t.reference,
      t.transaction_type,
      t.amount,
      formatDisplayAmount(t.amount),
      t.payment_method,
      t.status,
      new Date(t.requested_at).toLocaleString(),
      getStatusDescription(t.status, t.transaction_type)
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
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
            onClick={fetchTransactions}
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
              <h1 className="text-3xl font-bold text-white">Transactions</h1>
              <p className="text-gray-400 mt-2">
                Track and manage all your financial activities
              </p>
            </div>

            <div className="flex items-center gap-4">
              {/* Display Currency Toggle */}


              {/* Currency Selector */}
              <CurrencySelector />

              {/* Export Button */}
              {filteredTransactions.length > 0 && (
                <button
                  onClick={exportToCSV}
                  className="p-2 bg-[#030614] border-2 border-[#F97316] rounded-lg hover:bg-[#F97316] transition group"
                  title="Export to CSV"
                >
                  <PrinterIcon className="w-5 h-5 text-gray-400 group-hover:text-white transition" />
                </button>
              )}
            </div>
          </div>

          {/* Balance Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-[#0A1929] to-[#0F2744] rounded-2xl shadow-xl p-6 mb-8 border-2 border-[#F97316]"
          >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <p className="text-sm text-gray-400">Available Balance</p>
                <p className="text-4xl font-bold text-[#F97316]">
                  {formatDisplayAmount(user?.available_balance || 0)}
                </p>
                {showConverted && (
                  <p className="text-sm text-gray-500 mt-1">
                    ≈ {formatUSD(user?.available_balance || 0)}
                  </p>
                )}
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={() => setShowDepositModal(true)}
                  variant="primary"
                  className="flex items-center gap-2"
                  disabled={actionLoading}
                >
                  <ArrowDownTrayIcon className="w-4 h-4" />
                  Deposit
                </Button>
                <Button
                  onClick={() => setShowWithdrawModal(true)}
                  variant="secondary"
                  className="flex items-center gap-2"
                  disabled={actionLoading}
                >
                  <ArrowUpTrayIcon className="w-4 h-4" />
                  Withdraw
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Summary Stats */}
          {summary && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <motion.div
                whileHover={{ y: -5 }}
                className="bg-[#0A1929] rounded-xl shadow-xl p-4 border-2 border-[#F97316] border-opacity-30 hover:border-opacity-100 transition-all duration-300"
              >
                <p className="text-sm text-gray-400">Total Deposits</p>
                <p className="text-xl font-bold text-white">
                  {formatDisplayAmount(summary.total_deposits || 0)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {summary.total_deposits_count || 0} transactions
                </p>
              </motion.div>

              <motion.div
                whileHover={{ y: -5 }}
                className="bg-[#0A1929] rounded-xl shadow-xl p-4 border-2 border-[#F97316] border-opacity-30 hover:border-opacity-100 transition-all duration-300"
              >
                <p className="text-sm text-gray-400">Total Withdrawals</p>
                <p className="text-xl font-bold text-white">
                  {formatDisplayAmount(summary.total_withdrawals || 0)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {summary.total_withdrawals_count || 0} transactions
                </p>
              </motion.div>

              <motion.div
                whileHover={{ y: -5 }}
                className="bg-[#0A1929] rounded-xl shadow-xl p-4 border-2 border-[#F97316] border-opacity-30 hover:border-opacity-100 transition-all duration-300"
              >
                <p className="text-sm text-gray-400">Pending Deposits</p>
                <p className="text-xl font-bold text-yellow-500">
                  {formatDisplayAmount(summary.pending_deposits || 0)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {summary.pending_deposits_count || 0} awaiting
                </p>
              </motion.div>

              <motion.div
                whileHover={{ y: -5 }}
                className="bg-[#0A1929] rounded-xl shadow-xl p-4 border-2 border-[#F97316] border-opacity-30 hover:border-opacity-100 transition-all duration-300"
              >
                <p className="text-sm text-gray-400">Pending Withdrawals</p>
                <p className="text-xl font-bold text-[#F97316]">
                  {formatDisplayAmount(summary.pending_withdrawals || 0)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {summary.pending_withdrawals_count || 0} awaiting approval
                </p>
              </motion.div>
            </div>
          )}

          {/* Filters */}
          <div className="bg-[#030614] rounded-xl shadow-xl p-4 mb-6 border-2 border-[#F97316] border-opacity-30">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap gap-2">
                {['all', 'deposit', 'withdrawal'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setFilter(type)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                      filter === type
                        ? 'bg-[#F97316] text-white'
                        : 'bg-[#0A1929] text-gray-400 hover:text-[#F97316] border border-gray-700 hover:border-[#F97316]'
                    }`}
                  >
                    {type === 'all' ? 'All' : type === 'deposit' ? 'Deposits' : 'Withdrawals'}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-[#F97316] transition"
              >
                <FunnelIcon className="w-4 h-4" />
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </button>
            </div>

            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 pt-4 border-t border-gray-700"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={dateRange.start}
                      onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                      className="w-full px-3 py-2 bg-[#0A1929] border-2 border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-[#F97316] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={dateRange.end}
                      onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                      className="w-full px-3 py-2 bg-[#0A1929] border-2 border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-[#F97316] focus:border-transparent"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={resetFilters}
                      className="px-4 py-2 text-sm text-[#F97316] hover:text-[#FB923C] flex items-center gap-2 transition"
                    >
                      <ArrowPathIcon className="w-4 h-4" />
                      Reset Filters
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Transactions List */}
          <div className="bg-[#0A1929] rounded-xl shadow-xl overflow-hidden border-2 border-[#F97316] border-opacity-30">
            {filteredTransactions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead className="bg-[#030614]">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Reference
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Method
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-[#0A1929] divide-y divide-gray-700">
                    {filteredTransactions.map((transaction) => (
                      <motion.tr
                        key={transaction.id}
                        whileHover={{ backgroundColor: '#0F2744' }}
                        className="transition-colors duration-300"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <code className="text-sm font-mono bg-[#030614] px-2 py-1 rounded text-[#F97316] border border-[#F97316]">
                            {transaction.reference}
                          </code>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${
                            transaction.transaction_type === 'deposit'
                              ? 'bg-green-500 bg-opacity-20 text-green-500 border-green-500'
                              : 'bg-blue-500 bg-opacity-20 text-blue-500 border-blue-500'
                          }`}>
                            {transaction.transaction_type === 'deposit' ? (
                              <ArrowDownTrayIcon className="w-3 h-3 mr-1" />
                            ) : (
                              <ArrowUpTrayIcon className="w-3 h-3 mr-1" />
                            )}
                            {transaction.transaction_type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <span className={`font-medium ${
                              transaction.transaction_type === 'deposit'
                                ? 'text-green-500'
                                : 'text-blue-500'
                            }`}>
                              {formatDisplayAmount(transaction.amount)}
                            </span>
                            {showConverted && (
                              <p className="text-xs text-gray-500">
                                {formatUSD(transaction.amount)}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                          {transaction.payment_method?.replace('_', ' ') || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(transaction.status)}`}>
                              {getStatusIcon(transaction.status)}
                              {transaction.status}
                            </span>
                            <span className="text-xs text-gray-500 mt-1">
                              {getStatusDescription(transaction.status, transaction.transaction_type)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                          <div>{new Date(transaction.requested_at).toLocaleDateString()}</div>
                          <div className="text-xs text-gray-500">
                            {new Date(transaction.requested_at).toLocaleTimeString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                          {transaction.mpesa_phone || transaction.bank_name || '—'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={() => setSelectedTransaction(transaction)}
                            className="text-[#F97316] hover:text-[#FB923C] font-medium transition"
                          >
                            View
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-16">
                <DocumentTextIcon className="w-16 h-16 mx-auto text-gray-500 mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">No Transactions Found</h3>
                <p className="text-gray-400 mb-6">
                  {filter !== 'all' || dateRange.start || dateRange.end
                    ? 'No transactions match your filters. Try adjusting your filters.'
                    : 'You haven\'t made any transactions yet.'}
                </p>
                <div className="flex gap-3 justify-center">
                  <Button
                    onClick={() => setShowDepositModal(true)}
                    variant="primary"
                    size="sm"
                  >
                    Make a Deposit
                  </Button>
                  <Button
                    onClick={() => setShowWithdrawModal(true)}
                    variant="secondary"
                    size="sm"
                  >
                    Request Withdrawal
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Transaction Count */}
          {filteredTransactions.length > 0 && (
            <p className="mt-4 text-sm text-gray-500 text-right flex items-center justify-end gap-2">
              <span className="w-1 h-1 bg-[#F97316] rounded-full"></span>
              Showing {filteredTransactions.length} of {transactions.length} transactions
            </p>
          )}
        </motion.div>
      </div>

      {/* Deposit Modal */}
      <Modal
        isOpen={showDepositModal}
        onClose={() => {
          setShowDepositModal(false);
          resetForms();
        }}
        title="Make a Deposit"
        size="lg"
      >
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Amount in {showConverted ? currency.code : 'USD'}
            </label>
            <div className="relative">
              <CurrencyDollarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#F97316]" />
              <input
                type="number"
                value={depositAmountDisplay}
                onChange={(e) => handleDepositAmountChange(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-[#030614] border-2 border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-[#F97316] focus:border-transparent transition"
                placeholder={`Enter amount in ${showConverted ? currency.code : 'USD'}`}
                min={showConverted ?
                  (currency.code === 'KES' ? MIN_DEPOSIT_KES :
                   currency.code === 'EUR' ? MIN_DEPOSIT_EUR :
                   MIN_DEPOSIT_USD)
                  : MIN_DEPOSIT_USD}
                step="0.01"
              />
            </div>

            {/* Live conversion preview and min deposit info */}
            {depositAmountUSD > 0 && (
              <div className="mt-2 space-y-2">
                <div className="p-3 bg-[#030614] rounded-lg border border-[#F97316]">
                  <p className="text-sm text-[#F97316]">
                    {showConverted ? (
                      <>
                        <span className="font-medium">USD Equivalent:</span> {formatUSD(depositAmountUSD)}
                      </>
                    ) : (
                      <>
                        <span className="font-medium">≈ {getConvertedPreview(depositAmountUSD)}</span> {currency.code}
                      </>
                    )}
                  </p>
                </div>

                {/* Minimum deposit info */}
                <div className="p-2 bg-[#030614] rounded-lg border border-gray-700">
                  <p className="text-xs text-gray-400">
                    <span className="font-medium text-[#F97316]">Minimum deposit:</span>{' '}
                    {showConverted ? (
                      currency.code === 'KES' ? `${MIN_DEPOSIT_KES} KES` :
                      currency.code === 'EUR' ? `${MIN_DEPOSIT_EUR} EUR` :
                      `$${MIN_DEPOSIT_USD} USD`
                    ) : (
                      `$${MIN_DEPOSIT_USD} USD`
                    )}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Payment Method
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setPaymentMethod('bank_transfer')}
                className={`p-4 border-2 rounded-lg text-center transition ${
                  paymentMethod === 'bank_transfer'
                    ? 'border-[#F97316] bg-[#030614] text-[#F97316]'
                    : 'border-gray-700 bg-[#030614] text-gray-400 hover:border-[#F97316] hover:text-[#F97316]'
                }`}
              >
                <BanknotesIcon className="w-6 h-6 mx-auto mb-2" />
                <span className="text-sm font-medium">Bank Transfer</span>
              </button>
              <button
                onClick={() => setPaymentMethod('mpesa')}
                className={`p-4 border-2 rounded-lg text-center transition ${
                  paymentMethod === 'mpesa'
                    ? 'border-[#F97316] bg-[#030614] text-[#F97316]'
                    : 'border-gray-700 bg-[#030614] text-gray-400 hover:border-[#F97316] hover:text-[#F97316]'
                }`}
              >
                <PhoneIcon className="w-6 h-6 mx-auto mb-2" />
                <span className="text-sm font-medium">M-Pesa</span>
              </button>
              <button
                onClick={() => setPaymentMethod('credit_card')}
                className={`p-4 border-2 rounded-lg text-center transition ${
                  paymentMethod === 'credit_card'
                    ? 'border-[#F97316] bg-[#030614] text-[#F97316]'
                    : 'border-gray-700 bg-[#030614] text-gray-400 hover:border-[#F97316] hover:text-[#F97316]'
                }`}
              >
                <CreditCardIcon className="w-6 h-6 mx-auto mb-2" />
                <span className="text-sm font-medium">Credit Card</span>
              </button>
              <button
                onClick={() => setPaymentMethod('crypto')}
                className={`p-4 border-2 rounded-lg text-center transition ${
                  paymentMethod === 'crypto'
                    ? 'border-[#F97316] bg-[#030614] text-[#F97316]'
                    : 'border-gray-700 bg-[#030614] text-gray-400 hover:border-[#F97316] hover:text-[#F97316]'
                }`}
              >
                <svg className="w-6 h-6 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                <span className="text-sm font-medium">Crypto</span>
              </button>
            </div>
          </div>

          {paymentMethod === 'bank_transfer' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Bank Name
                </label>
                <input
                  type="text"
                  value={bankDetails.bankName}
                  onChange={(e) => setBankDetails({ ...bankDetails, bankName: e.target.value })}
                  className="w-full px-4 py-2 bg-[#030614] border-2 border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-[#F97316] focus:border-transparent transition"
                  placeholder="e.g., Equity Bank"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Account Number
                </label>
                <input
                  type="text"
                  value={bankDetails.accountNumber}
                  onChange={(e) => setBankDetails({ ...bankDetails, accountNumber: e.target.value })}
                  className="w-full px-4 py-2 bg-[#030614] border-2 border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-[#F97316] focus:border-transparent transition"
                  placeholder="Enter your account number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Account Name
                </label>
                <input
                  type="text"
                  value={bankDetails.accountName}
                  onChange={(e) => setBankDetails({ ...bankDetails, accountName: e.target.value })}
                  className="w-full px-4 py-2 bg-[#030614] border-2 border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-[#F97316] focus:border-transparent transition"
                  placeholder="Name on the account"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  SWIFT Code (Optional)
                </label>
                <input
                  type="text"
                  value={bankDetails.swiftCode}
                  onChange={(e) => setBankDetails({ ...bankDetails, swiftCode: e.target.value })}
                  className="w-full px-4 py-2 bg-[#030614] border-2 border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-[#F97316] focus:border-transparent transition"
                  placeholder="e.g., EQBLKENA"
                />
              </div>
            </div>
          )}

          {paymentMethod === 'mpesa' && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                M-Pesa Phone Number
              </label>
              <input
                type="tel"
                value={mpesaPhone}
                onChange={(e) => setMpesaPhone(e.target.value)}
                className="w-full px-4 py-2 bg-[#030614] border-2 border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-[#F97316] focus:border-transparent transition"
                placeholder="e.g., 254712345678"
              />
              <p className="text-xs text-gray-500 mt-1">Include country code (e.g., 254 for Kenya)</p>
            </div>
          )}

          {paymentMethod === 'crypto' && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Cryptocurrency Address
              </label>
              <input
                type="text"
                value={cryptoAddress}
                onChange={(e) => setCryptoAddress(e.target.value)}
                className="w-full px-4 py-2 bg-[#030614] border-2 border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-[#F97316] focus:border-transparent transition"
                placeholder="Enter your wallet address"
              />
            </div>
          )}

          <div className="bg-[#030614] p-4 rounded-lg border border-[#F97316]">
            <p className="text-sm text-[#F97316]">
              <strong>Instant Deposit:</strong> Your deposit will be processed immediately and your balance will be updated instantly. You'll receive a confirmation with your transaction reference.
            </p>
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              onClick={handleDeposit}
              variant="primary"
              loading={actionLoading}
              fullWidth
              disabled={actionLoading}
            >
              {actionLoading ? 'Processing...' : `Deposit ${depositAmountUSD > 0 ? (showConverted ? getConvertedPreview(depositAmountUSD) : formatUSD(depositAmountUSD)) : ''}`}
            </Button>
            <Button
              onClick={() => {
                setShowDepositModal(false);
                resetForms();
              }}
              variant="secondary"
              fullWidth
              disabled={actionLoading}
            >
              Cancel
            </Button>
          </div>

          {/* Exchange Rate Info */}
          {showConverted && (
            <p className="text-xs text-gray-500 text-center flex items-center justify-center gap-2">
              <span className="w-1 h-1 bg-[#F97316] rounded-full"></span>
              Amounts shown in {currency.code} are converted from USD at rate 1 USD = {currency.exchangeRate} {currency.code}
            </p>
          )}
        </div>
      </Modal>

      {/* Withdrawal Modal */}
      <Modal
        isOpen={showWithdrawModal}
        onClose={() => {
          setShowWithdrawModal(false);
          resetForms();
        }}
        title="Request Withdrawal"
        size="lg"
      >
        <div className="space-y-6">
          <div className="bg-[#030614] p-4 rounded-lg border border-[#F97316]">
            <p className="text-sm text-[#F97316]">
              Available Balance: <span className="font-bold">{formatDisplayAmount(user?.available_balance || 0)}</span>
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Amount in {showConverted ? currency.code : 'USD'}
            </label>
            <div className="relative">
              <CurrencyDollarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#F97316]" />
              <input
                type="number"
                value={withdrawAmountDisplay}
                onChange={(e) => handleWithdrawAmountChange(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-[#030614] border-2 border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-[#F97316] focus:border-transparent transition"
                placeholder={`Enter amount in ${showConverted ? currency.code : 'USD'}`}
                min="1"
                max={showConverted ? (user?.available_balance || 0) * currency.exchangeRate : user?.available_balance || 0}
                step="0.01"
              />
            </div>

            {/* Live conversion preview */}
            {withdrawAmountUSD > 0 && (
              <div className="mt-2 p-3 bg-[#030614] rounded-lg border border-[#F97316]">
                <p className="text-sm text-[#F97316]">
                  {showConverted ? (
                    <>
                      <span className="font-medium">USD Equivalent:</span> {formatUSD(withdrawAmountUSD)}
                    </>
                  ) : (
                    <>
                      <span className="font-medium">≈ {getConvertedPreview(withdrawAmountUSD)}</span> {currency.code}
                    </>
                  )}
                </p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Withdrawal Method
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setPaymentMethod('bank_transfer')}
                className={`p-4 border-2 rounded-lg text-center transition ${
                  paymentMethod === 'bank_transfer'
                    ? 'border-[#F97316] bg-[#030614] text-[#F97316]'
                    : 'border-gray-700 bg-[#030614] text-gray-400 hover:border-[#F97316] hover:text-[#F97316]'
                }`}
              >
                <BanknotesIcon className="w-6 h-6 mx-auto mb-2" />
                <span className="text-sm font-medium">Bank Transfer</span>
              </button>
              <button
                onClick={() => setPaymentMethod('mpesa')}
                className={`p-4 border-2 rounded-lg text-center transition ${
                  paymentMethod === 'mpesa'
                    ? 'border-[#F97316] bg-[#030614] text-[#F97316]'
                    : 'border-gray-700 bg-[#030614] text-gray-400 hover:border-[#F97316] hover:text-[#F97316]'
                }`}
              >
                <PhoneIcon className="w-6 h-6 mx-auto mb-2" />
                <span className="text-sm font-medium">M-Pesa</span>
              </button>
            </div>
          </div>

          {paymentMethod === 'bank_transfer' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Bank Name
                </label>
                <input
                  type="text"
                  value={bankDetails.bankName}
                  onChange={(e) => setBankDetails({ ...bankDetails, bankName: e.target.value })}
                  className="w-full px-4 py-2 bg-[#030614] border-2 border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-[#F97316] focus:border-transparent transition"
                  placeholder="e.g., Equity Bank"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Account Number
                </label>
                <input
                  type="text"
                  value={bankDetails.accountNumber}
                  onChange={(e) => setBankDetails({ ...bankDetails, accountNumber: e.target.value })}
                  className="w-full px-4 py-2 bg-[#030614] border-2 border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-[#F97316] focus:border-transparent transition"
                  placeholder="Enter your account number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Account Name
                </label>
                <input
                  type="text"
                  value={bankDetails.accountName}
                  onChange={(e) => setBankDetails({ ...bankDetails, accountName: e.target.value })}
                  className="w-full px-4 py-2 bg-[#030614] border-2 border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-[#F97316] focus:border-transparent transition"
                  placeholder="Name on the account"
                />
              </div>
            </div>
          )}

          {paymentMethod === 'mpesa' && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                M-Pesa Phone Number
              </label>
              <input
                type="tel"
                value={mpesaPhone}
                onChange={(e) => setMpesaPhone(e.target.value)}
                className="w-full px-4 py-2 bg-[#030614] border-2 border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-[#F97316] focus:border-transparent transition"
                placeholder="e.g., 254712345678"
              />
              <p className="text-xs text-gray-500 mt-1">You will receive the money on this number</p>
            </div>
          )}

          <div className="bg-[#030614] p-4 rounded-lg border border-yellow-500">
            <p className="text-sm text-yellow-500">
              <strong>Processing Time:</strong> Withdrawals are processed within 24-48 hours and require admin approval.
              Your balance will be deducted immediately. You'll receive email updates on your request status.
            </p>
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              onClick={handleWithdraw}
              variant="primary"
              loading={actionLoading}
              fullWidth
              disabled={actionLoading}
            >
              {actionLoading ? 'Processing...' : `Request Withdrawal ${withdrawAmountUSD > 0 ? (showConverted ? getConvertedPreview(withdrawAmountUSD) : formatUSD(withdrawAmountUSD)) : ''}`}
            </Button>
            <Button
              onClick={() => {
                setShowWithdrawModal(false);
                resetForms();
              }}
              variant="secondary"
              fullWidth
              disabled={actionLoading}
            >
              Cancel
            </Button>
          </div>

          {/* Exchange Rate Info */}
          {showConverted && (
            <p className="text-xs text-gray-500 text-center flex items-center justify-center gap-2">
              <span className="w-1 h-1 bg-[#F97316] rounded-full"></span>
              Amounts shown in {currency.code} are converted from USD at rate 1 USD = {currency.exchangeRate} {currency.code}
            </p>
          )}
        </div>
      </Modal>

      {/* Transaction Details Modal */}
      <Modal
        isOpen={!!selectedTransaction}
        onClose={() => setSelectedTransaction(null)}
        title={`Transaction Details - ${selectedTransaction?.reference}`}
        size="lg"
      >
        {selectedTransaction && (
          <div className="space-y-6">
            {/* Status Banner */}
            <div className={`p-4 rounded-lg border ${
              selectedTransaction.status === 'completed' ? 'bg-green-500 bg-opacity-10 border-green-500' :
              selectedTransaction.status === 'pending' ? 'bg-yellow-500 bg-opacity-10 border-yellow-500' :
              selectedTransaction.status === 'processing' ? 'bg-blue-500 bg-opacity-10 border-blue-500' :
              'bg-red-500 bg-opacity-10 border-red-500'
            }`}>
              <div className="flex items-center gap-3">
                {getStatusIcon(selectedTransaction.status)}
                <div>
                  <p className={`font-semibold ${
                    selectedTransaction.status === 'completed' ? 'text-green-500' :
                    selectedTransaction.status === 'pending' ? 'text-yellow-500' :
                    selectedTransaction.status === 'processing' ? 'text-blue-500' :
                    'text-red-500'
                  }`}>
                    {selectedTransaction.status.charAt(0).toUpperCase() + selectedTransaction.status.slice(1)}
                  </p>
                  <p className="text-sm text-gray-400">
                    {getStatusDescription(selectedTransaction.status, selectedTransaction.transaction_type)}
                  </p>
                </div>
              </div>
            </div>

            {/* Transaction Details Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#030614] p-3 rounded-lg">
                <p className="text-xs text-gray-400">Transaction Type</p>
                <p className="font-medium text-white flex items-center gap-1 mt-1">
                  {selectedTransaction.transaction_type === 'deposit' ? (
                    <ArrowDownTrayIcon className="w-4 h-4 text-green-500" />
                  ) : (
                    <ArrowUpTrayIcon className="w-4 h-4 text-blue-500" />
                  )}
                  {selectedTransaction.transaction_type.charAt(0).toUpperCase() + selectedTransaction.transaction_type.slice(1)}
                </p>
              </div>
              <div className="bg-[#030614] p-3 rounded-lg">
                <p className="text-xs text-gray-400">Reference</p>
                <code className="font-mono bg-[#0A1929] px-2 py-1 rounded text-sm text-[#F97316] border border-[#F97316] mt-1 inline-block">
                  {selectedTransaction.reference}
                </code>
              </div>
              <div className="bg-[#030614] p-3 rounded-lg">
                <p className="text-xs text-gray-400">Amount</p>
                <div className="mt-1">
                  <p className="font-bold text-lg text-[#F97316]">
                    {formatDisplayAmount(selectedTransaction.amount)}
                  </p>
                  {showConverted && (
                    <p className="text-xs text-gray-500">
                      ≈ {formatUSD(selectedTransaction.amount)}
                    </p>
                  )}
                </div>
              </div>
              <div className="bg-[#030614] p-3 rounded-lg">
                <p className="text-xs text-gray-400">Payment Method</p>
                <p className="font-medium text-white mt-1">
                  {selectedTransaction.payment_method?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </p>
              </div>
              <div className="bg-[#030614] p-3 rounded-lg">
                <p className="text-xs text-gray-400">Requested</p>
                <p className="font-medium text-white mt-1">
                  {new Date(selectedTransaction.requested_at).toLocaleDateString()} at{' '}
                  {new Date(selectedTransaction.requested_at).toLocaleTimeString()}
                </p>
              </div>
              {selectedTransaction.processed_at && (
                <div className="bg-[#030614] p-3 rounded-lg">
                  <p className="text-xs text-gray-400">Processed</p>
                  <p className="font-medium text-white mt-1">
                    {new Date(selectedTransaction.processed_at).toLocaleDateString()} at{' '}
                    {new Date(selectedTransaction.processed_at).toLocaleTimeString()}
                  </p>
                </div>
              )}
              {selectedTransaction.completed_at && (
                <div className="bg-[#030614] p-3 rounded-lg">
                  <p className="text-xs text-gray-400">Completed</p>
                  <p className="font-medium text-white mt-1">
                    {new Date(selectedTransaction.completed_at).toLocaleDateString()} at{' '}
                    {new Date(selectedTransaction.completed_at).toLocaleTimeString()}
                  </p>
                </div>
              )}
            </div>

            {/* Payment Details */}
            {(selectedTransaction.bank_name || selectedTransaction.mpesa_phone) && (
              <div className="border-t border-gray-700 pt-4">
                <h4 className="font-medium text-white mb-3">Payment Details</h4>
                {selectedTransaction.bank_name && (
                  <div className="space-y-2 text-sm bg-[#030614] p-3 rounded-lg">
                    <p><span className="text-gray-400">Bank:</span> <span className="text-white">{selectedTransaction.bank_name}</span></p>
                    {selectedTransaction.account_number && (
                      <p><span className="text-gray-400">Account:</span> <span className="text-white">{selectedTransaction.account_number}</span></p>
                    )}
                    {selectedTransaction.account_name && (
                      <p><span className="text-gray-400">Account Name:</span> <span className="text-white">{selectedTransaction.account_name}</span></p>
                    )}
                  </div>
                )}
                {selectedTransaction.mpesa_phone && (
                  <div className="space-y-2 text-sm bg-[#030614] p-3 rounded-lg">
                    <p><span className="text-gray-400">Phone:</span> <span className="text-white">{selectedTransaction.mpesa_phone}</span></p>
                    {selectedTransaction.mpesa_receipt && (
                      <p><span className="text-gray-400">Receipt:</span> <span className="text-white">{selectedTransaction.mpesa_receipt}</span></p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Admin Notes */}
            {selectedTransaction.admin_notes && (
              <div className="border-t border-gray-700 pt-4">
                <h4 className="font-medium text-white mb-2">Admin Notes</h4>
                <p className="text-sm text-gray-400 bg-[#030614] p-3 rounded-lg border border-[#F97316]">
                  {selectedTransaction.admin_notes}
                </p>
              </div>
            )}

            {/* Cancel Button (only for pending withdrawals) */}
            {selectedTransaction.status === 'pending' && selectedTransaction.transaction_type === 'withdrawal' && (
              <div className="border-t border-gray-700 pt-4">
                <Button
                  onClick={() => handleCancelTransaction(selectedTransaction.id)}
                  variant="danger"
                  fullWidth
                  loading={actionLoading}
                  disabled={actionLoading}
                >
                  Cancel Withdrawal Request
                </Button>
                <p className="text-xs text-gray-500 text-center mt-2">
                  Cancelling will refund the amount to your available balance
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Transactions;