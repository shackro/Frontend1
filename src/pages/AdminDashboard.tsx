import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '../services/api';
import type { Product } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { Navigate } from 'react-router-dom';
import Loader from '../components/common/Loader';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import CurrencySelector from '../components/common/CurrencySelector';
import {
  PencilIcon,
  TrashIcon,
  PlusIcon,
  EyeIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  CubeIcon,
  TagIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const productSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  price: z.number().min(1, 'Price must be greater than 0'),
  daily_income: z.number().min(1, 'Daily income must be greater than 0'),
  validity_period: z.number().min(1, 'Validity period must be at least 1 day'),
  b_commission: z.number().min(0, 'Commission must be 0 or greater'),
  c_commission: z.number().min(0, 'Commission must be 0 or greater'),
  d_commission: z.number().min(0, 'Commission must be 0 or greater'),
  description: z.string().optional(),
  min_investment: z.number().optional().nullable(),
  max_investment: z.number().optional().nullable(),
});

type ProductFormData = z.infer<typeof productSchema>;

const AdminDashboard: React.FC = () => {
  const { isAdmin } = useAuth();
  const { currency, convertAmount, formatAmount } = useCurrency();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [previewProduct, setPreviewProduct] = useState<Product | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [displayCurrency, setDisplayCurrency] = useState<'USD' | 'converted'>('converted');
  const [watchPrice, setWatchPrice] = useState(0);

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      price: 0,
      daily_income: 0,
      validity_period: 0,
      b_commission: 0,
      c_commission: 0,
      d_commission: 0,
      description: '',
      min_investment: null,
      max_investment: null,
    }
  });

  // Watch price for real-time conversion display
  const watchedPrice = watch('price');
  useEffect(() => {
    setWatchPrice(watchedPrice || 0);
  }, [watchedPrice]);

  useEffect(() => {
    if (!isAdmin) return;
    fetchData();
  }, [isAdmin]);

  if (!isAdmin) {
    return <Navigate to="/" />;
  }

  const fetchData = async () => {
    try {
      const [productsData] = await Promise.all([
        api.getProducts(),
      ]);
      setProducts(productsData);

      // Calculate stats in USD (base currency)
      const totalProducts = productsData.length;
      const activeProducts = productsData.filter(p => p.is_active).length;
      const totalValueUSD = productsData.reduce((sum, p) => sum + p.price, 0);
      const avgRoi = productsData.reduce((sum, p) => sum + p.roi_percentage, 0) / productsData.length || 0;

      setStats({
        totalProducts,
        activeProducts,
        totalValueUSD,
        totalValueConverted: convertAmount(totalValueUSD, 'USD', currency.code),
        averageRoi: avgRoi,
      });
    } catch (error) {
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: ProductFormData) => {
    try {
      // Data is already in USD as per the form (since we're storing in USD)
      if (editingProduct) {
        await api.updateProduct(editingProduct.id, data);
        toast.success('Product updated successfully', {
          style: {
            background: '#0A1929',
            color: '#F97316',
            border: '1px solid #F97316',
          },
        });
      } else {
        await api.createProduct(data);
        toast.success('Product created successfully', {
          style: {
            background: '#0A1929',
            color: '#F97316',
            border: '1px solid #F97316',
          },
        });
      }

      setShowForm(false);
      setEditingProduct(null);
      reset();
      fetchData();
    } catch (error) {
      toast.error('Operation failed', {
        style: {
          background: '#0A1929',
          color: '#F97316',
          border: '1px solid #DC2626',
        },
      });
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    reset({
      name: product.name,
      price: product.price,
      daily_income: product.daily_income,
      validity_period: product.validity_period,
      b_commission: product.b_commission,
      c_commission: product.c_commission,
      d_commission: product.d_commission,
      description: product.description || '',
      min_investment: product.min_investment,
      max_investment: product.max_investment,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      await api.deleteProduct(id);
      toast.success('Product deleted successfully', {
        style: {
          background: '#0A1929',
          color: '#F97316',
          border: '1px solid #F97316',
        },
      });
      fetchData();
    } catch (error) {
      toast.error('Failed to delete product', {
        style: {
          background: '#0A1929',
          color: '#F97316',
          border: '1px solid #DC2626',
        },
      });
    }
  };

  // Helper function to format amounts with currency selection
  const formatAmountWithCurrency = (amountUSD: number, showSymbol: boolean = true) => {
    if (displayCurrency === 'USD') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amountUSD);
    } else {
      const converted = convertAmount(amountUSD, 'USD', currency.code);
      return formatAmount(converted, currency.code);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center bg-[#0A1929]">
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
          {/* Header with Currency Controls */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
              <p className="text-gray-400 mt-2">Manage investment products</p>
            </div>

            <div className="flex items-center gap-4">
              {/* Display Currency Toggle */}
              <div className="flex items-center bg-[#030614] rounded-lg border-2 border-[#F97316] p-1">
                <button
                  onClick={() => setDisplayCurrency('USD')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition ${
                    displayCurrency === 'USD'
                      ? 'bg-[#F97316] text-white'
                      : 'text-gray-400 hover:text-[#F97316]'
                  }`}
                >
                  USD
                </button>
                <button
                  onClick={() => setDisplayCurrency('converted')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition ${
                    displayCurrency === 'converted'
                      ? 'bg-[#F97316] text-white'
                      : 'text-gray-400 hover:text-[#F97316]'
                  }`}
                >
                  <span className="flex items-center gap-1">
                    <span>{currency.flag}</span>
                    <span>Converted</span>
                  </span>
                </button>
              </div>

              {/* Currency Selector */}
              <CurrencySelector />

              <Button
                onClick={() => {
                  setEditingProduct(null);
                  reset({
                    name: '',
                    price: 0,
                    daily_income: 0,
                    validity_period: 0,
                    b_commission: 0,
                    c_commission: 0,
                    d_commission: 0,
                    description: '',
                    min_investment: null,
                    max_investment: null,
                  });
                  setShowForm(true);
                }}
                variant="primary"
              >
                <PlusIcon className="w-5 h-5 mr-2" />
                Add Product
              </Button>
            </div>
          </div>

          {/* Stats Cards with Currency Display */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <motion.div
                whileHover={{ y: -5 }}
                className="bg-[#0A1929] rounded-xl shadow-lg p-6 border-2 border-[#F97316] border-opacity-30 hover:border-opacity-100 transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-400">Total Products</p>
                  <CubeIcon className="w-5 h-5 text-[#F97316]" />
                </div>
                <p className="text-2xl font-bold text-white">{stats.totalProducts}</p>
              </motion.div>

              <motion.div
                whileHover={{ y: -5 }}
                className="bg-[#0A1929] rounded-xl shadow-lg p-6 border-2 border-[#F97316] border-opacity-30 hover:border-opacity-100 transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-400">Active Products</p>
                  <TagIcon className="w-5 h-5 text-[#F97316]" />
                </div>
                <p className="text-2xl font-bold text-[#F97316]">{stats.activeProducts}</p>
              </motion.div>

              <motion.div
                whileHover={{ y: -5 }}
                className="bg-[#0A1929] rounded-xl shadow-lg p-6 border-2 border-[#F97316] border-opacity-30 hover:border-opacity-100 transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-400">Total Value</p>
                  <CurrencyDollarIcon className="w-5 h-5 text-[#F97316]" />
                </div>
                <p className="text-2xl font-bold text-white">
                  {displayCurrency === 'USD'
                    ? formatAmountWithCurrency(stats.totalValueUSD)
                    : formatAmountWithCurrency(stats.totalValueUSD)
                  }
                </p>
                {displayCurrency === 'USD' && (
                  <p className="text-xs text-gray-500 mt-1">
                    ≈ {formatAmount(stats.totalValueConverted, currency.code)} {currency.flag}
                  </p>
                )}
              </motion.div>

              <motion.div
                whileHover={{ y: -5 }}
                className="bg-[#0A1929] rounded-xl shadow-lg p-6 border-2 border-[#F97316] border-opacity-30 hover:border-opacity-100 transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-400">Avg ROI</p>
                  <ChartBarIcon className="w-5 h-5 text-[#F97316]" />
                </div>
                <p className="text-2xl font-bold text-[#F97316]">{stats.averageRoi.toFixed(1)}%</p>
              </motion.div>
            </div>
          )}

          {/* Products Table */}
          <div className="bg-[#0A1929] rounded-xl shadow-xl overflow-hidden border-2 border-[#F97316] border-opacity-30">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-[#030614]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Price ({displayCurrency === 'USD' ? 'USD' : currency.code})
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Daily Income ({displayCurrency === 'USD' ? 'USD' : currency.code})
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Duration
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Total Return ({displayCurrency === 'USD' ? 'USD' : currency.code})
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      ROI
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Commissions
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
                  {products.map((product) => (
                    <motion.tr
                      key={product.id}
                      whileHover={{ backgroundColor: '#0F2744' }}
                      className="transition-colors duration-300"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-white">
                          {product.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-white">
                          {formatAmountWithCurrency(product.price)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-[#F97316] font-semibold">
                          {formatAmountWithCurrency(product.daily_income)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-white">
                          {product.validity_period} days
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-[#F97316]">
                          {formatAmountWithCurrency(product.total_return)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          product.roi_percentage > 50
                            ? 'bg-[#F97316] bg-opacity-20 text-[#F97316] border border-[#F97316]'
                            : 'bg-yellow-500 bg-opacity-20 text-yellow-500 border border-yellow-500'
                        }`}>
                          {product.roi_percentage.toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-xs space-y-1">
                          <div className="text-gray-400">L1: <span className="text-white ml-1">{formatAmountWithCurrency(product.b_commission)}</span></div>
                          <div className="text-gray-400">L2: <span className="text-white ml-1">{formatAmountWithCurrency(product.c_commission)}</span></div>
                          <div className="text-gray-400">L3: <span className="text-white ml-1">{formatAmountWithCurrency(product.d_commission)}</span></div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          product.is_active
                            ? 'bg-green-500 bg-opacity-20 text-green-500 border border-green-500'
                            : 'bg-red-500 bg-opacity-20 text-red-500 border border-red-500'
                        }`}>
                          {product.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex gap-2">
                          <button
                            onClick={() => setPreviewProduct(product)}
                            className="text-blue-400 hover:text-blue-300 p-1 transition duration-300 transform hover:scale-110"
                            title="Preview"
                          >
                            <EyeIcon className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleEdit(product)}
                            className="text-[#F97316] hover:text-[#FB923C] p-1 transition duration-300 transform hover:scale-110"
                            title="Edit"
                          >
                            <PencilIcon className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="text-red-400 hover:text-red-300 p-1 transition duration-300 transform hover:scale-110"
                            title="Delete"
                          >
                            <TrashIcon className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Product Form Modal */}
          <Modal
            isOpen={showForm}
            onClose={() => {
              setShowForm(false);
              setEditingProduct(null);
            }}
            title={editingProduct ? 'Edit Product' : 'Create New Product'}
            size="lg"
          >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Product Name
                </label>
                <input
                  type="text"
                  {...register('name')}
                  className="w-full px-4 py-2 bg-[#0A1929] border-2 border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-[#F97316] focus:border-transparent transition duration-300"
                  placeholder="e.g., OMD Spark"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-400">{errors.name.message}</p>
                )}
              </div>

              <div className="bg-[#0A1929] p-4 rounded-lg mb-4 border border-[#F97316]">
                <p className="text-sm text-[#F97316] flex items-center gap-2">
                  <CurrencyDollarIcon className="w-5 h-5" />
                  All prices are entered in USD (base currency) and will be converted to other currencies automatically
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Price (USD)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    {...register('price', { valueAsNumber: true })}
                    className="w-full px-4 py-2 bg-[#0A1929] border-2 border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-[#F97316] focus:border-transparent transition duration-300"
                  />
                  {errors.price && (
                    <p className="mt-1 text-sm text-red-400">{errors.price.message}</p>
                  )}
                  {!editingProduct && watchPrice > 0 && (
                    <p className="mt-1 text-xs text-gray-400">
                      ≈ {formatAmount(convertAmount(watchPrice, 'USD', currency.code), currency.code)}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Daily Income (USD)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    {...register('daily_income', { valueAsNumber: true })}
                    className="w-full px-4 py-2 bg-[#0A1929] border-2 border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-[#F97316] focus:border-transparent transition duration-300"
                  />
                  {errors.daily_income && (
                    <p className="mt-1 text-sm text-red-400">{errors.daily_income.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Validity Period (days)
                  </label>
                  <input
                    type="number"
                    {...register('validity_period', { valueAsNumber: true })}
                    className="w-full px-4 py-2 bg-[#0A1929] border-2 border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-[#F97316] focus:border-transparent transition duration-300"
                  />
                  {errors.validity_period && (
                    <p className="mt-1 text-sm text-red-400">{errors.validity_period.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Level 1 Commission (10%) (USD)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    {...register('b_commission', { valueAsNumber: true })}
                    className="w-full px-4 py-2 bg-[#0A1929] border-2 border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-[#F97316] focus:border-transparent transition duration-300"
                  />
                  {errors.b_commission && (
                    <p className="mt-1 text-sm text-red-400">{errors.b_commission.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Level 2 Commission (6%) (USD)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    {...register('c_commission', { valueAsNumber: true })}
                    className="w-full px-4 py-2 bg-[#0A1929] border-2 border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-[#F97316] focus:border-transparent transition duration-300"
                  />
                  {errors.c_commission && (
                    <p className="mt-1 text-sm text-red-400">{errors.c_commission.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Level 3 Commission (3%) (USD)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    {...register('d_commission', { valueAsNumber: true })}
                    className="w-full px-4 py-2 bg-[#0A1929] border-2 border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-[#F97316] focus:border-transparent transition duration-300"
                  />
                  {errors.d_commission && (
                    <p className="mt-1 text-sm text-red-400">{errors.d_commission.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Min Investment (USD) (Optional)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    {...register('min_investment', { valueAsNumber: true })}
                    className="w-full px-4 py-2 bg-[#0A1929] border-2 border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-[#F97316] focus:border-transparent transition duration-300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Max Investment (USD) (Optional)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    {...register('max_investment', { valueAsNumber: true })}
                    className="w-full px-4 py-2 bg-[#0A1929] border-2 border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-[#F97316] focus:border-transparent transition duration-300"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  {...register('description')}
                  rows={4}
                  className="w-full px-4 py-2 bg-[#0A1929] border-2 border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-[#F97316] focus:border-transparent transition duration-300"
                  placeholder="Enter product description..."
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="submit" variant="primary" fullWidth>
                  {editingProduct ? 'Update Product' : 'Create Product'}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  fullWidth
                  onClick={() => {
                    setShowForm(false);
                    setEditingProduct(null);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Modal>

          {/* Product Preview Modal */}
          <Modal
            isOpen={!!previewProduct}
            onClose={() => setPreviewProduct(null)}
            title={previewProduct?.name}
            size="md"
          >
            {previewProduct && (
              <div className="space-y-4">
                <div className="flex justify-between border-b border-gray-700 pb-2">
                  <span className="text-gray-400">Price:</span>
                  <span className="font-semibold text-white">{formatAmountWithCurrency(previewProduct.price)}</span>
                </div>
                <div className="flex justify-between border-b border-gray-700 pb-2">
                  <span className="text-gray-400">Daily Income:</span>
                  <span className="font-semibold text-[#F97316]">
                    {formatAmountWithCurrency(previewProduct.daily_income)}
                  </span>
                </div>
                <div className="flex justify-between border-b border-gray-700 pb-2">
                  <span className="text-gray-400">Duration:</span>
                  <span className="font-semibold text-white">{previewProduct.validity_period} days</span>
                </div>
                <div className="flex justify-between border-b border-gray-700 pb-2">
                  <span className="text-gray-400">Total Return:</span>
                  <span className="font-semibold text-[#F97316]">
                    {formatAmountWithCurrency(previewProduct.total_return)}
                  </span>
                </div>
                <div className="flex justify-between border-b border-gray-700 pb-2">
                  <span className="text-gray-400">ROI:</span>
                  <span className="font-semibold text-[#F97316]">{previewProduct.roi_percentage.toFixed(1)}%</span>
                </div>

                <div className="border-t border-gray-700 pt-3">
                  <h4 className="font-semibold text-white mb-2">Commission Structure:</h4>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Level 1 (10%):</span>
                      <span className="text-white">{formatAmountWithCurrency(previewProduct.b_commission)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Level 2 (6%):</span>
                      <span className="text-white">{formatAmountWithCurrency(previewProduct.c_commission)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Level 3 (3%):</span>
                      <span className="text-white">{formatAmountWithCurrency(previewProduct.d_commission)}</span>
                    </div>
                  </div>
                </div>

                <div className="text-xs text-gray-500 mt-2 p-2 bg-[#0A1929] rounded border border-[#F97316]">
                  * All amounts are shown in {displayCurrency === 'USD' ? 'USD' : currency.code}
                  {displayCurrency !== 'USD' && ` (converted from USD at rate ${currency.exchangeRate})`}
                </div>

                <Button onClick={() => setPreviewProduct(null)} variant="secondary" fullWidth>
                  Close
                </Button>
              </div>
            )}
          </Modal>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminDashboard;