import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Product } from '../types';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useCurrency } from '../contexts/CurrencyContext';
import Loader from '../components/common/Loader';
import Button from '../components/common/Button';
import CurrencySelector from '../components/common/CurrencySelector';
import { ArrowDownTrayIcon, XCircleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const investmentSchema = z.object({
  amount: z.number().min(1, 'Amount must be greater than 0'),
});

type InvestmentFormData = z.infer<typeof investmentSchema>;

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { currency, convertAmount, formatAmount, showConverted, setShowConverted } = useCurrency();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [investing, setInvesting] = useState(false);
  const [calculatedReturns, setCalculatedReturns] = useState<any>(null);
  const [balanceCheck, setBalanceCheck] = useState<{
    can_invest: boolean;
    available_balance: number;
    required_amount: number;
    shortfall: number;
  } | null>(null);

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

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<InvestmentFormData>({
    resolver: zodResolver(investmentSchema),
    defaultValues: {
      amount: 0,
    },
  });

  const watchAmount = watch('amount');

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Please login to invest', {
        style: {
          background: '#0A1929',
          color: '#F97316',
          border: '1px solid #F97316',
        },
      });
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  useEffect(() => {
    if (product && watchAmount > 0) {
      calculateReturns();
      checkBalance();
    }
  }, [watchAmount, product]);

  const fetchProduct = async () => {
    if (!id) return;
    try {
      const data = await api.getProduct(id);
      setProduct(data);
      // Set default amount to product price (parsed to number)
      setValue('amount', parseNumeric(data.price));
    } catch (error) {
      toast.error('Failed to fetch product', {
        style: {
          background: '#0A1929',
          color: '#F97316',
          border: '1px solid #DC2626',
        },
      });
      navigate('/products');
    } finally {
      setLoading(false);
    }
  };

  const calculateReturns = async () => {
    if (!id || !watchAmount) return;
    try {
      const data = await api.calculateReturns(id, watchAmount);
      setCalculatedReturns(data);
    } catch (error) {
      console.error('Failed to calculate returns:', error);
    }
  };

  const checkBalance = async () => {
    if (!watchAmount || watchAmount <= 0) return;
    try {
      const response = await api.checkInvestmentEligibility(watchAmount);
      setBalanceCheck(response);
    } catch (error) {
      console.error('Failed to check balance:', error);
    }
  };

  const onSubmit = async (data: InvestmentFormData) => {
    if (!id) return;

    // Double-check balance before submitting
    if (user && user.available_balance < data.amount) {
      toast.error('Insufficient balance. Please deposit funds first.', {
        style: {
          background: '#0A1929',
          color: '#F97316',
          border: '1px solid #DC2626',
        },
      });
      return;
    }

    setInvesting(true);
    try {
      await api.createInvestment(id, data.amount);
      toast.success('Investment created successfully!', {
        style: {
          background: '#0A1929',
          color: '#F97316',
          border: '1px solid #F97316',
        },
      });
      navigate('/investments');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to create investment';
      toast.error(message, {
        style: {
          background: '#0A1929',
          color: '#F97316',
          border: '1px solid #DC2626',
        },
      });
    } finally {
      setInvesting(false);
    }
  };

  // Format amount based on selected currency preference
  const formatProductAmount = (amount: any): string => {
    const amountUSD = parseNumeric(amount);

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

  // Get the equivalent amount in selected currency for display
  const getConvertedAmount = (amountUSD: number): string => {
    const converted = convertAmount(amountUSD, 'USD', currency.code);
    return formatAmount(converted, currency.code);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A1929] pt-20 flex items-center justify-center">
        <Loader size="large" fullScreen />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#0A1929] pt-20 flex items-center justify-center">
        <div className="text-center">
          <XCircleIcon className="w-16 h-16 text-[#F97316] mx-auto mb-4" />
          <p className="text-gray-400">Product not found</p>
        </div>
      </div>
    );
  }

  // Parse product values for display
  const productPrice = parseNumeric(product.price);
  const productDailyIncome = parseNumeric(product.daily_income);
  const productTotalReturn = parseNumeric(product.total_return);
  const productRoiPercentage = parseNumeric(product.roi_percentage);
  const productBCommission = parseNumeric(product.b_commission);
  const productCCommission = parseNumeric(product.c_commission);
  const productDCommission = parseNumeric(product.d_commission);

  return (
    <div className="min-h-screen bg-[#0A1929] pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Breadcrumb with Currency Controls */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <nav>
              <ol className="flex items-center space-x-2 text-sm text-gray-400">
                <li>
                  <button onClick={() => navigate('/')} className="hover:text-[#F97316] transition">
                    Home
                  </button>
                </li>
                <li>/</li>
                <li>
                  <button onClick={() => navigate('/products')} className="hover:text-[#F97316] transition">
                    Products
                  </button>
                </li>
                <li>/</li>
                <li className="text-white font-medium">{product.name}</li>
              </ol>
            </nav>

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

              {/* Currency Selector */}
              <CurrencySelector />
            </div>
          </div>

          {/* Balance Alert */}
          {user && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-[#030614] rounded-lg border-2 border-[#F97316] border-opacity-30 flex flex-col sm:flex-row justify-between items-center gap-4"
            >
              <div>
                <p className="text-sm text-gray-400">Your Available Balance</p>
                <p className="text-2xl font-bold text-[#F97316]">
                  {formatProductAmount(user.available_balance)}
                </p>
              </div>
              <Link
                to="/transactions?action=deposit"
                className="inline-flex items-center px-4 py-2 bg-[#F97316] text-white rounded-lg hover:bg-[#FB923C] transition shadow-lg shadow-[#F97316]/20"
              >
                <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
                Deposit Funds
              </Link>
            </motion.div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Product Info */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-[#0A1929] rounded-2xl shadow-xl p-8 border-2 border-[#F97316] border-opacity-30"
            >
              <h1 className="text-3xl font-bold text-white mb-2">{product.name}</h1>
              <p className="text-gray-400 mb-6">Afro {product.name.split(' ')[1] || ''}</p>

              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-gray-700">
                  <span className="text-gray-400">Investment Amount</span>
                  <div className="text-right">
                    <span className="text-3xl font-bold text-white">
                      {formatProductAmount(productPrice)}
                    </span>
                    {showConverted && (
                      <p className="text-xs text-gray-500 mt-1">
                        USD {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: 'USD',
                          minimumFractionDigits: 0,
                        }).format(productPrice)}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-center py-3 border-b border-gray-700">
                  <span className="text-gray-400">Daily Income</span>
                  <div className="text-right">
                    <span className="text-xl font-semibold text-[#F97316]">
                      {formatProductAmount(productDailyIncome)}
                    </span>
                    {showConverted && (
                      <p className="text-xs text-gray-500">
                        USD {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: 'USD',
                          minimumFractionDigits: 0,
                        }).format(productDailyIncome)}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-center py-3 border-b border-gray-700">
                  <span className="text-gray-400">Duration</span>
                  <span className="font-semibold text-white">{product.validity_period} days</span>
                </div>

                <div className="flex justify-between items-center py-3 border-b border-gray-700">
                  <span className="text-gray-400">Total Return</span>
                  <div className="text-right">
                    <span className="text-xl font-semibold text-[#F97316]">
                      {formatProductAmount(productTotalReturn)}
                    </span>
                    {showConverted && (
                      <p className="text-xs text-gray-500">
                        USD {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: 'USD',
                          minimumFractionDigits: 0,
                        }).format(productTotalReturn)}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-center py-3 border-b border-gray-700">
                  <span className="text-gray-400">ROI</span>
                  <span className="px-3 py-1 bg-[#F97316] bg-opacity-20 text-[#F97316] rounded-full text-sm font-semibold border border-[#F97316]">
                    {productRoiPercentage.toFixed(1)}%
                  </span>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="font-semibold text-white mb-3">Description</h3>
                <p className="text-gray-400">
                  {product.description ||
                    'This product allows users to participate in a structured investment plan running for a fixed duration. Earnings are generated based on platform activity and product performance.'}
                </p>
              </div>

              <div className="mt-6">
                <h3 className="font-semibold text-white mb-3">Commission Structure</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Level 1 (Direct Referral - 10%)</span>
                    <div className="text-right">
                      <span className="font-medium text-white">{formatProductAmount(productBCommission)}</span>
                      {showConverted && (
                        <p className="text-xs text-gray-500">
                          USD {new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: 'USD',
                            minimumFractionDigits: 0,
                          }).format(productBCommission)}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Level 2 (6%)</span>
                    <div className="text-right">
                      <span className="font-medium text-white">{formatProductAmount(productCCommission)}</span>
                      {showConverted && (
                        <p className="text-xs text-gray-500">
                          USD {new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: 'USD',
                            minimumFractionDigits: 0,
                          }).format(productCCommission)}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Level 3 (3%)</span>
                    <div className="text-right">
                      <span className="font-medium text-white">{formatProductAmount(productDCommission)}</span>
                      {showConverted && (
                        <p className="text-xs text-gray-500">
                          USD {new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: 'USD',
                            minimumFractionDigits: 0,
                          }).format(productDCommission)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Investment Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-[#0A1929] rounded-2xl shadow-xl p-8 border-2 border-[#F97316] border-opacity-30"
            >
              <h2 className="text-2xl font-bold text-white mb-6">Make an Investment</h2>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Investment Amount ({showConverted ? currency.code : 'USD'})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    {...register('amount', { valueAsNumber: true })}
                    className="w-full px-4 py-3 bg-[#030614] border-2 border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-[#F97316] focus:border-transparent transition"
                    placeholder={`Enter amount in ${showConverted ? currency.code : 'USD'}`}
                  />
                  {errors.amount && (
                    <p className="mt-1 text-sm text-red-400">{errors.amount.message}</p>
                  )}

                  {/* Show converted amount preview */}
                  {watchAmount > 0 && showConverted && (
                    <p className="mt-2 text-sm text-gray-400">
                      ≈ {getConvertedAmount(watchAmount)} {currency.code}
                    </p>
                  )}

                  {watchAmount > 0 && !showConverted && product && (
                    <p className="mt-2 text-sm text-gray-400">
                      ≈ {getConvertedAmount(watchAmount)} {currency.code}
                    </p>
                  )}

                  <p className="mt-2 text-sm text-gray-500">
                    Minimum: {formatProductAmount(productPrice)}
                  </p>
                </div>

                {/* Balance Check Alert */}
                {balanceCheck && !balanceCheck.can_invest && (
                  <div className="bg-red-500 bg-opacity-10 border-l-4 border-red-500 p-4 rounded">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <XCircleIcon className="h-5 w-5 text-red-500" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-red-400">
                          <strong className="text-red-300">Insufficient Balance!</strong><br />
                          Available: {formatProductAmount(balanceCheck.available_balance)}<br />
                          Required: {formatProductAmount(balanceCheck.required_amount)}<br />
                          You need to deposit {formatProductAmount(balanceCheck.shortfall)} more.
                        </p>
                        <div className="mt-2">
                          <Link
                            to="/transactions?action=deposit"
                            className="inline-flex items-center px-3 py-2 border border-red-500 text-sm leading-4 font-medium rounded-md text-red-400 bg-transparent hover:bg-red-500 hover:text-white transition"
                          >
                            <ArrowDownTrayIcon className="w-4 h-4 mr-1" />
                            Deposit Funds
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {balanceCheck && balanceCheck.can_invest && (
                  <div className="bg-green-500 bg-opacity-10 border-l-4 border-green-500 p-4 rounded">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <CheckCircleIcon className="h-5 w-5 text-green-500" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-green-400">
                          <strong className="text-green-300">Sufficient Balance!</strong> You have enough funds to make this investment.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {calculatedReturns && (
                  <div className="bg-[#030614] rounded-lg p-4 border border-[#F97316]">
                    <h3 className="font-semibold text-[#F97316] mb-3">Projected Returns</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Daily Income:</span>
                        <div className="text-right">
                          <span className="font-semibold text-white">
                            {formatProductAmount(calculatedReturns.daily_return)}
                          </span>
                          {showConverted && (
                            <p className="text-xs text-gray-500">
                              USD {new Intl.NumberFormat('en-US', {
                                style: 'currency',
                                currency: 'USD',
                                minimumFractionDigits: 0,
                              }).format(parseNumeric(calculatedReturns.daily_return))}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Total Return:</span>
                        <div className="text-right">
                          <span className="font-semibold text-white">
                            {formatProductAmount(calculatedReturns.total_return)}
                          </span>
                          {showConverted && (
                            <p className="text-xs text-gray-500">
                              USD {new Intl.NumberFormat('en-US', {
                                style: 'currency',
                                currency: 'USD',
                                minimumFractionDigits: 0,
                              }).format(parseNumeric(calculatedReturns.total_return))}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">ROI:</span>
                        <span className="font-semibold text-[#F97316]">
                          {calculatedReturns.roi_percentage}%
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Duration:</span>
                        <span className="font-semibold text-white">
                          {calculatedReturns.validity_days} days
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-yellow-500 bg-opacity-10 border-l-4 border-yellow-500 p-4 rounded">
                  <p className="text-sm text-yellow-400">
                    <strong>Risk Warning:</strong> Investments involve risk. Returns are not
                    guaranteed. Only invest what you can afford to lose.
                  </p>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  loading={investing}
                  disabled={balanceCheck ? !balanceCheck.can_invest : false}
                >
                  Confirm Investment
                </Button>
              </form>

              {/* Exchange Rate Info */}
              {showConverted && (
                <p className="mt-4 text-xs text-gray-500 text-center flex items-center justify-center gap-2">
                  <span className="w-1 h-1 bg-[#F97316] rounded-full"></span>
                  Amounts shown in {currency.code} are converted from USD at rate 1 USD = {currency.exchangeRate} {currency.code}
                </p>
              )}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProductDetail;