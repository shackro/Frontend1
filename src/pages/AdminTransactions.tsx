import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useCurrency } from '../contexts/CurrencyContext';
import api from '../services/api';
import Loader from '../components/common/Loader';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  EyeIcon,
  BanknotesIcon,
  PhoneIcon,
  UserIcon,
  IdentificationIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface AdminTransaction {
  id: string;
  user: {
    email: string;
    first_name: string;
    last_name: string;
  };
  transaction_type: 'deposit' | 'withdrawal';
  amount: number;
  currency: string;
  status: string;
  payment_method: string;
  reference: string;
  requested_at: string;
  bank_name?: string;
  account_number?: string;
  account_name?: string;
  mpesa_phone?: string;
}

const AdminTransactions: React.FC = () => {
  const { isAdmin } = useAuth();
  const { formatAmount } = useCurrency();
  const [transactions, setTransactions] = useState<AdminTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTransaction, setSelectedTransaction] = useState<AdminTransaction | null>(null);
  const [processing, setProcessing] = useState(false);
  const [filter, setFilter] = useState('pending');

  useEffect(() => {
    if (!isAdmin) return;
    fetchTransactions();
  }, [isAdmin, filter]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const data = await api.getAdminTransactions(filter);
      setTransactions(data);
    } catch (error) {
      toast.error('Failed to fetch transactions', {
        style: {
          background: '#0A1929',
          color: '#F97316',
          border: '1px solid #DC2626',
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (transactionId: string) => {
    if (!window.confirm('Are you sure you want to approve this transaction?')) return;

    setProcessing(true);
    try {
      await api.approveTransaction(transactionId);
      toast.success('Transaction approved successfully', {
        style: {
          background: '#0A1929',
          color: '#F97316',
          border: '1px solid #F97316',
        },
      });
      fetchTransactions();
      setSelectedTransaction(null);
    } catch (error) {
      toast.error('Failed to approve transaction', {
        style: {
          background: '#0A1929',
          color: '#F97316',
          border: '1px solid #DC2626',
        },
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (transactionId: string) => {
    if (!window.confirm('Are you sure you want to reject this transaction?')) return;

    setProcessing(true);
    try {
      await api.rejectTransaction(transactionId);
      toast.success('Transaction rejected', {
        style: {
          background: '#0A1929',
          color: '#F97316',
          border: '1px solid #F97316',
        },
      });
      fetchTransactions();
      setSelectedTransaction(null);
    } catch (error) {
      toast.error('Failed to reject transaction', {
        style: {
          background: '#0A1929',
          color: '#F97316',
          border: '1px solid #DC2626',
        },
      });
    } finally {
      setProcessing(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#0A1929] flex items-center justify-center">
        <div className="text-center">
          <XCircleIcon className="w-16 h-16 text-[#F97316] mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-gray-400">You don't have permission to view this page.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A1929] pt-20 flex items-center justify-center">
        <Loader size="large" fullScreen />
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
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white">Transaction Management</h1>
              <p className="text-gray-400 mt-2">Review and manage user transactions</p>
            </div>
            <div className="text-sm text-gray-400">
              Total: {transactions.length} transactions
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="bg-[#030614] rounded-xl shadow-lg p-4 mb-6 border-2 border-[#F97316] border-opacity-30">
            <div className="flex gap-2 flex-wrap">
              {['pending', 'processing', 'completed', 'failed'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition duration-300 ${
                    filter === status
                      ? 'bg-[#F97316] text-white shadow-lg shadow-[#F97316]/20'
                      : 'bg-[#0A1929] text-gray-400 hover:text-[#F97316] border border-gray-700 hover:border-[#F97316]'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Transactions Table */}
          <div className="bg-[#0A1929] rounded-xl shadow-xl overflow-hidden border-2 border-[#F97316] border-opacity-30">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-[#030614]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Method</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-[#0A1929] divide-y divide-gray-700">
                  {transactions.map((tx) => (
                    <motion.tr
                      key={tx.id}
                      whileHover={{ backgroundColor: '#0F2744' }}
                      className="transition-colors duration-300"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-[#030614] rounded-full flex items-center justify-center border border-[#F97316]">
                            <UserIcon className="h-5 w-5 text-[#F97316]" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-white">
                              {tx.user.first_name} {tx.user.last_name}
                            </div>
                            <div className="text-sm text-gray-400">{tx.user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${
                          tx.transaction_type === 'deposit'
                            ? 'bg-green-500 bg-opacity-20 text-green-500 border-green-500'
                            : 'bg-blue-500 bg-opacity-20 text-blue-500 border-blue-500'
                        }`}>
                          {tx.transaction_type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-white">
                          {formatAmount(tx.amount)}
                        </div>
                        <div className="text-xs text-gray-400">{tx.currency}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-300">
                          {tx.payment_method.replace('_', ' ')}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${
                          tx.status === 'completed' ? 'bg-green-500 bg-opacity-20 text-green-500 border-green-500' :
                          tx.status === 'pending' ? 'bg-yellow-500 bg-opacity-20 text-yellow-500 border-yellow-500' :
                          tx.status === 'processing' ? 'bg-blue-500 bg-opacity-20 text-blue-500 border-blue-500' :
                          'bg-red-500 bg-opacity-20 text-red-500 border-red-500'
                        }`}>
                          {tx.status === 'completed' && <CheckCircleIcon className="w-3 h-3" />}
                          {tx.status === 'pending' && <ClockIcon className="w-3 h-3" />}
                          {tx.status === 'processing' && <ClockIcon className="w-3 h-3" />}
                          {tx.status === 'failed' && <XCircleIcon className="w-3 h-3" />}
                          {tx.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-300">
                          {new Date(tx.requested_at).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-400">
                          {new Date(tx.requested_at).toLocaleTimeString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => setSelectedTransaction(tx)}
                            className="text-blue-400 hover:text-blue-300 p-1 transition duration-300 transform hover:scale-110"
                            title="View Details"
                          >
                            <EyeIcon className="w-5 h-5" />
                          </button>
                          {tx.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleApprove(tx.id)}
                                className="text-[#F97316] hover:text-[#FB923C] p-1 transition duration-300 transform hover:scale-110"
                                disabled={processing}
                                title="Approve"
                              >
                                <CheckCircleIcon className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => handleReject(tx.id)}
                                className="text-red-400 hover:text-red-300 p-1 transition duration-300 transform hover:scale-110"
                                disabled={processing}
                                title="Reject"
                              >
                                <XCircleIcon className="w-5 h-5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {transactions.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400">No {filter} transactions found</div>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Transaction Details Modal */}
      <Modal
        isOpen={!!selectedTransaction}
        onClose={() => setSelectedTransaction(null)}
        title="Transaction Details"
        size="lg"
      >
        {selectedTransaction && (
          <div className="space-y-6">
            {/* Header with Reference */}
            <div className="bg-[#030614] p-4 rounded-lg border border-[#F97316]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <IdentificationIcon className="w-5 h-5 text-[#F97316]" />
                  <span className="text-sm text-gray-400">Reference:</span>
                </div>
                <span className="font-mono text-sm text-white bg-[#0A1929] px-3 py-1 rounded border border-gray-700">
                  {selectedTransaction.reference}
                </span>
              </div>
            </div>

            {/* Main Details Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#030614] p-4 rounded-lg">
                <p className="text-sm text-gray-400 mb-1">User</p>
                <p className="font-medium text-white">{selectedTransaction.user.email}</p>
                <p className="text-sm text-gray-400 mt-1">
                  {selectedTransaction.user.first_name} {selectedTransaction.user.last_name}
                </p>
              </div>

              <div className="bg-[#030614] p-4 rounded-lg">
                <p className="text-sm text-gray-400 mb-1">Amount</p>
                <p className="font-medium text-2xl text-[#F97316]">{formatAmount(selectedTransaction.amount)}</p>
                <p className="text-xs text-gray-400 mt-1">{selectedTransaction.currency}</p>
              </div>

              <div className="bg-[#030614] p-4 rounded-lg">
                <p className="text-sm text-gray-400 mb-1">Type</p>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${
                  selectedTransaction.transaction_type === 'deposit'
                    ? 'bg-green-500 bg-opacity-20 text-green-500 border-green-500'
                    : 'bg-blue-500 bg-opacity-20 text-blue-500 border-blue-500'
                }`}>
                  {selectedTransaction.transaction_type}
                </span>
              </div>

              <div className="bg-[#030614] p-4 rounded-lg">
                <p className="text-sm text-gray-400 mb-1">Status</p>
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${
                  selectedTransaction.status === 'completed' ? 'bg-green-500 bg-opacity-20 text-green-500 border-green-500' :
                  selectedTransaction.status === 'pending' ? 'bg-yellow-500 bg-opacity-20 text-yellow-500 border-yellow-500' :
                  selectedTransaction.status === 'processing' ? 'bg-blue-500 bg-opacity-20 text-blue-500 border-blue-500' :
                  'bg-red-500 bg-opacity-20 text-red-500 border-red-500'
                }`}>
                  {selectedTransaction.status === 'completed' && <CheckCircleIcon className="w-3 h-3" />}
                  {selectedTransaction.status === 'pending' && <ClockIcon className="w-3 h-3" />}
                  {selectedTransaction.status === 'processing' && <ClockIcon className="w-3 h-3" />}
                  {selectedTransaction.status === 'failed' && <XCircleIcon className="w-3 h-3" />}
                  {selectedTransaction.status}
                </span>
              </div>

              <div className="bg-[#030614] p-4 rounded-lg">
                <p className="text-sm text-gray-400 mb-1">Payment Method</p>
                <p className="font-medium text-white flex items-center gap-2">
                  <BanknotesIcon className="w-4 h-4 text-[#F97316]" />
                  {selectedTransaction.payment_method.replace('_', ' ')}
                </p>
              </div>

              <div className="bg-[#030614] p-4 rounded-lg">
                <p className="text-sm text-gray-400 mb-1">Requested Date</p>
                <p className="font-medium text-white">
                  {new Date(selectedTransaction.requested_at).toLocaleDateString()}
                </p>
                <p className="text-xs text-gray-400">
                  {new Date(selectedTransaction.requested_at).toLocaleTimeString()}
                </p>
              </div>
            </div>

            {/* Bank Details */}
            {selectedTransaction.bank_name && (
              <div className="bg-[#030614] p-4 rounded-lg border border-[#F97316]">
                <h4 className="font-medium text-white mb-3 flex items-center gap-2">
                  <BanknotesIcon className="w-5 h-5 text-[#F97316]" />
                  Bank Details
                </h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-gray-400">Bank Name</p>
                    <p className="text-sm text-white">{selectedTransaction.bank_name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Account Number</p>
                    <p className="text-sm text-white">{selectedTransaction.account_number}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Account Name</p>
                    <p className="text-sm text-white">{selectedTransaction.account_name}</p>
                  </div>
                </div>
              </div>
            )}

            {/* M-Pesa Details */}
            {selectedTransaction.mpesa_phone && (
              <div className="bg-[#030614] p-4 rounded-lg border border-[#F97316]">
                <h4 className="font-medium text-white mb-3 flex items-center gap-2">
                  <PhoneIcon className="w-5 h-5 text-[#F97316]" />
                  M-Pesa Details
                </h4>
                <div>
                  <p className="text-xs text-gray-400">Phone Number</p>
                  <p className="text-sm text-white">{selectedTransaction.mpesa_phone}</p>
                </div>
              </div>
            )}

            {/* Action Buttons for Pending Transactions */}
            {selectedTransaction.status === 'pending' && (
              <div className="flex gap-4 pt-4 border-t border-gray-700">
                <Button
                  onClick={() => handleApprove(selectedTransaction.id)}
                  variant="primary"
                  loading={processing}
                  fullWidth
                >
                  <CheckCircleIcon className="w-5 h-5 mr-2" />
                  Approve Transaction
                </Button>
                <Button
                  onClick={() => handleReject(selectedTransaction.id)}
                  variant="danger"
                  loading={processing}
                  fullWidth
                >
                  <XCircleIcon className="w-5 h-5 mr-2" />
                  Reject Transaction
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminTransactions;