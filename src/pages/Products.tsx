import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import type { Product } from '../types';
import { useCurrency } from '../contexts/CurrencyContext';
import api from '../services/api';
import ProductCard from '../components/investment/ProductCard';
import Loader from '../components/common/Loader';
import Modal from '../components/common/Modal';
import CurrencySelector from '../components/common/CurrencySelector';
import { XCircleIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

// Define a type for the API response
interface ApiResponse<T> {
  results?: T[];
  [key: string]: any;
}

const Products: React.FC = () => {
  const { currency, convertAmount, formatAmount, showConverted, setShowConverted } = useCurrency();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  // Debug effect to log products when they change
  useEffect(() => {
    if (products.length > 0) {
      console.log('Products loaded:', products);
      console.log('First product sample:', products[0]);
    }
  }, [products]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await api.getProducts() as Product[] | ApiResponse<Product>;

      if (Array.isArray(data)) {
        setProducts(data);
      } else if (data && typeof data === 'object') {
        if ('results' in data && Array.isArray(data.results)) {
          setProducts(data.results);
        } else {
          console.error('Unexpected data format:', data);
          setProducts([]);
          setError('Invalid data format received from server');
        }
      } else {
        setProducts([]);
        setError('No products available');
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
      toast.error('Failed to fetch products', {
        style: {
          background: '#0A1929',
          color: '#F97316',
          border: '1px solid #DC2626',
        },
      });
      setProducts([]);
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

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
            onClick={fetchProducts}
            className="px-4 py-2 bg-[#F97316] text-white rounded-lg hover:bg-[#FB923C] transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A1929] pt-20">
      {/* Hero Section with Currency Controls */}
      <section className="bg-gradient-to-r from-[#0A1929] to-[#0F2744] text-white py-16 border-b-2 border-[#F97316]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Investment Products
            </h1>
            <p className="text-xl max-w-3xl mx-auto mb-8 text-gray-300">
              Choose from our range of structured investment products designed to help you grow your wealth
            </p>

            {/* Currency Controls in Hero */}
            <div className="flex justify-center items-center gap-4">
              {/* Display Currency Toggle */}
              <div className="flex items-center bg-[#030614] rounded-lg border-2 border-[#F97316] p-1">

                <button
                  onClick={() => setShowConverted(true)}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition ${
                    showConverted
                      ? 'bg-[#F97316] text-white'
                      : 'text-gray-400 hover:text-[#F97316]'
                  }`}
                >
                  <span className="flex items-center gap-1">
                    Currency
                  </span>
                </button>
              </div>

              {/* Currency Selector */}
              <div className="bg-[#030614] rounded-lg ">
                <CurrencySelector />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {products.length === 0 ? (
          <div className="text-center py-12 bg-[#0A1929] rounded-xl border-2 border-[#F97316] border-opacity-30">
            <p className="text-gray-400 mb-4">No products available at the moment.</p>
            <Link
              to="/"
              className="inline-flex items-center px-4 py-2 bg-[#F97316] text-white rounded-lg hover:bg-[#FB923C] transition shadow-lg shadow-[#F97316]/20"
            >
              Return Home
            </Link>
          </div>
        ) : (
          <>
            {/* Currency Info Banner */}
            {showConverted && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 text-center"
              >
                <p className="text-sm text-gray-400 flex items-center justify-center gap-2">
                  <span className="w-1 h-1 bg-[#F97316] rounded-full"></span>
                  Showing prices in {currency.code} (converted from USD at rate 1 USD = {currency.exchangeRate} {currency.code})
                </p>
              </motion.div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
              {products.map((product, index) => (
                <ProductCard
                  key={product.id || index}
                  product={product}
                  onViewDetails={setSelectedProduct}
                />
              ))}
            </div>
          </>
        )}
      </section>

      {/* Product Details Modal with Currency Support */}
      <Modal
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        title={selectedProduct?.name}
        size="lg"
      >
        {selectedProduct && (
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-white mb-2">Product Overview</h3>
              <p className="text-gray-400">
                {selectedProduct.description ||
                  'This product allows users to participate in a structured investment plan running for a fixed duration. Earnings are generated based on platform activity and product performance.'}
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-2">Investment Terms</h3>
              <ul className="space-y-2">
                <li className="flex items-start justify-between">
                  <span className="flex items-center text-gray-400">
                    <span className="inline-block w-2 h-2 bg-[#F97316] rounded-full mt-2 mr-3"></span>
                    <span>Minimum Investment:</span>
                  </span>
                  <div className="text-right">
                    <span className="font-semibold text-white">{formatProductAmount(selectedProduct.price)}</span>
                    {showConverted && (
                      <p className="text-xs text-gray-500">
                        USD {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: 'USD',
                          minimumFractionDigits: 0,
                        }).format(parseNumeric(selectedProduct.price))}
                      </p>
                    )}
                  </div>
                </li>
                <li className="flex items-start justify-between">
                  <span className="flex items-center text-gray-400">
                    <span className="inline-block w-2 h-2 bg-[#F97316] rounded-full mt-2 mr-3"></span>
                    <span>Duration:</span>
                  </span>
                  <span className="font-semibold text-white">{selectedProduct.validity_period} days</span>
                </li>
                <li className="flex items-start justify-between">
                  <span className="flex items-center text-gray-400">
                    <span className="inline-block w-2 h-2 bg-[#F97316] rounded-full mt-2 mr-3"></span>
                    <span>Daily Income:</span>
                  </span>
                  <div className="text-right">
                    <span className="font-semibold text-[#F97316]">{formatProductAmount(selectedProduct.daily_income)}</span>
                    {showConverted && (
                      <p className="text-xs text-gray-500">
                        USD {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: 'USD',
                          minimumFractionDigits: 0,
                        }).format(parseNumeric(selectedProduct.daily_income))}
                      </p>
                    )}
                  </div>
                </li>
                <li className="flex items-start justify-between">
                  <span className="flex items-center text-gray-400">
                    <span className="inline-block w-2 h-2 bg-[#F97316] rounded-full mt-2 mr-3"></span>
                    <span>Total Expected Return:</span>
                  </span>
                  <div className="text-right">
                    <span className="font-semibold text-[#F97316]">{formatProductAmount(selectedProduct.total_return)}</span>
                    {showConverted && (
                      <p className="text-xs text-gray-500">
                        USD {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: 'USD',
                          minimumFractionDigits: 0,
                        }).format(parseNumeric(selectedProduct.total_return))}
                      </p>
                    )}
                  </div>
                </li>
                <li className="flex items-start justify-between">
                  <span className="flex items-center text-gray-400">
                    <span className="inline-block w-2 h-2 bg-[#F97316] rounded-full mt-2 mr-3"></span>
                    <span>ROI:</span>
                  </span>
                  <span className="px-3 py-1 bg-[#F97316] bg-opacity-20 text-[#F97316] rounded-full text-sm font-semibold border border-[#F97316]">
                    {parseNumeric(selectedProduct.roi_percentage).toFixed(1)}%
                  </span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-2">Commission Structure</h3>
              <ul className="space-y-2">
                <li className="flex items-start justify-between">
                  <span className="flex items-center text-gray-400">
                    <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3"></span>
                    <span>Level 1 (Direct Referral - 10%):</span>
                  </span>
                  <div className="text-right">
                    <span className="font-semibold text-white">{formatProductAmount(selectedProduct.b_commission)}</span>
                    {showConverted && (
                      <p className="text-xs text-gray-500">
                        USD {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: 'USD',
                          minimumFractionDigits: 0,
                        }).format(parseNumeric(selectedProduct.b_commission))}
                      </p>
                    )}
                  </div>
                </li>
                <li className="flex items-start justify-between">
                  <span className="flex items-center text-gray-400">
                    <span className="inline-block w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3"></span>
                    <span>Level 2 (6%):</span>
                  </span>
                  <div className="text-right">
                    <span className="font-semibold text-white">{formatProductAmount(selectedProduct.c_commission)}</span>
                    {showConverted && (
                      <p className="text-xs text-gray-500">
                        USD {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: 'USD',
                          minimumFractionDigits: 0,
                        }).format(parseNumeric(selectedProduct.c_commission))}
                      </p>
                    )}
                  </div>
                </li>
                <li className="flex items-start justify-between">
                  <span className="flex items-center text-gray-400">
                    <span className="inline-block w-2 h-2 bg-indigo-500 rounded-full mt-2 mr-3"></span>
                    <span>Level 3 (3%):</span>
                  </span>
                  <div className="text-right">
                    <span className="font-semibold text-white">{formatProductAmount(selectedProduct.d_commission)}</span>
                    {showConverted && (
                      <p className="text-xs text-gray-500">
                        USD {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: 'USD',
                          minimumFractionDigits: 0,
                        }).format(parseNumeric(selectedProduct.d_commission))}
                      </p>
                    )}
                  </div>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-2">Important Notes</h3>
              <ul className="space-y-2">
                <li className="flex items-start text-gray-400">
                  <span className="inline-block w-2 h-2 bg-red-500 rounded-full mt-2 mr-3"></span>
                  <span>Earnings are not guaranteed</span>
                </li>
                <li className="flex items-start text-gray-400">
                  <span className="inline-block w-2 h-2 bg-red-500 rounded-full mt-2 mr-3"></span>
                  <span>Early withdrawal may not be permitted</span>
                </li>
                <li className="flex items-start text-gray-400">
                  <span className="inline-block w-2 h-2 bg-red-500 rounded-full mt-2 mr-3"></span>
                  <span>Users must agree to all terms before participation</span>
                </li>
              </ul>
            </div>

            {/* Exchange Rate Info in Modal */}
            {showConverted && (
              <div className="text-xs text-gray-500 border-t border-gray-700 pt-2 flex items-center justify-center gap-2">
                <span className="w-1 h-1 bg-[#F97316] rounded-full"></span>
                All amounts shown in {currency.code} are converted from USD at rate 1 USD = {currency.exchangeRate} {currency.code}
              </div>
            )}

            <div className="flex gap-4 pt-4">
              <button
                onClick={() => setSelectedProduct(null)}
                className="flex-1 px-4 py-2 border-2 border-[#F97316] rounded-lg text-[#F97316] hover:bg-[#F97316] hover:text-white transition duration-300"
              >
                Close
              </button>
              <Link
                to={`/product/${selectedProduct.id}`}
                className="flex-1 px-4 py-2 bg-[#F97316] text-white rounded-lg hover:bg-[#FB923C] transition duration-300 text-center shadow-lg shadow-[#F97316]/20"
                onClick={() => setSelectedProduct(null)}
              >
                Invest Now
              </Link>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Products;