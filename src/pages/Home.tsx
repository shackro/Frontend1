import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useCurrency } from '../contexts/CurrencyContext';
import CurrencySelector from '../components/common/CurrencySelector';
import {
  ArrowTrendingUpIcon,
  UsersIcon,
  GiftIcon,
  ShieldCheckIcon,
  ClockIcon,
  GlobeAltIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';

const Home: React.FC = () => {
  const { currency, convertAmount, formatAmount } = useCurrency();
  const [showConverted, setShowConverted] = useState(true);

  const features = [
    {
      icon: <ArrowTrendingUpIcon className="w-6 h-6" />,
      title: "Multiple Income Streams",
      description: "Generate income through product revenue, team growth, and referral bonuses"
    },
    {
      icon: <ClockIcon className="w-6 h-6" />,
      title: "Structured Timelines",
      description: "Clear product durations from 25-36 days with transparent earning structures"
    },
    {
      icon: <UsersIcon className="w-6 h-6" />,
      title: "Team Building",
      description: "Earn 10%, 6%, and 3% commissions from your team's investments"
    },
    {
      icon: <ShieldCheckIcon className="w-6 h-6" />,
      title: "Secure & Transparent",
      description: "All transactions and earnings are securely recorded and trackable"
    },
    {
      icon: <GiftIcon className="w-6 h-6" />,
      title: "Referral Rewards",
      description: "Get rewarded for inviting friends and building your network"
    },
    {
      icon: <GlobeAltIcon className="w-6 h-6" />,
      title: "Global Access",
      description: "Participate from anywhere in the world, 24/7 access to your investments"
    }
  ];

  // Product data in USD (base currency)
  const productsUSD = [
    { name: 'Afro Spark', price: 10, return: 12.5, days: 25 },
    { name: 'Afro Gold', price: 36, return: 4, days: 28 },
    { name: 'Afro Titan', price: 62, return: 2, days: 30 },
    { name: 'Afro Legend', price: 37, return: 2.6, days: 36 },
  ];

  // Format product price based on selected currency
  const formatProductPrice = (priceUSD: number): string => {
    if (!showConverted) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(priceUSD);
    }

    const converted = convertAmount(priceUSD, 'USD', currency.code);
    return formatAmount(converted, currency.code);
  };

  // Get products with converted prices
  const products = productsUSD.map(product => ({
    ...product,
    price: formatProductPrice(product.price),
    priceUSD: product.price,
    return: `${product.return}%`
  }));

  return (
    <div className="min-h-screen min-w-screen bg-[#0A1929]">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-800 via-[#0F2744] to-[#F97316] text-white pt-20">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Smart Investments.
              <br />
              <span className="text-[#F97316]">Structured Growth.</span>
              <br />
              Real Opportunities.
            </h1>
            <p className="text-xl md:text-2xl mb-10 max-w-3xl mx-auto text-gray-200">
              Afro Connect is a modern investment platform designed to help individuals grow wealth
              through time-based products, team performance, and strategic connections.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to="/register"
                className="px-8 py-3 bg-[#F97316] text-white rounded-lg font-semibold hover:bg-[#FB923C] transition duration-300 shadow-lg hover:shadow-xl border-2 border-white"
              >
                Get Started Now
              </Link>
              <Link
                to="/products"
                className="px-8 py-3 border-2 border-[#F97316] text-white rounded-lg font-semibold hover:bg-[#F97316] hover:text-white transition duration-300"
              >
                View Products
              </Link>
              {/* Currency Selector for hero section */}
              <div className="ml-4">
                <CurrencySelector />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 120" className="w-full h-auto">
            <path fill="#0A1929" fillOpacity="1" d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"></path>
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-[#0A1929]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Why Choose Afro Connect
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Experience a new way of investing with transparency, community, and structured growth
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="p-6 bg-[#030614] rounded-xl hover:shadow-2xl transition-all duration-300 group border-2 border-transparent hover:border-[#F97316]"
              >
                <div className="w-12 h-12 bg-[#0A1929] rounded-lg flex items-center justify-center text-[#F97316] mb-4 group-hover:bg-[#F97316] group-hover:text-white transition-all duration-300 border border-[#F97316]">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-400">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Products Preview */}
      <section className="py-20 bg-[#030614]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="flex flex-col items-center gap-4 mb-4">
              <h2 className="text-3xl md:text-4xl font-bold text-white">
                Popular Investment Products
              </h2>
              {/* Display Currency Toggle */}
              <div className="flex items-center bg-[#0A1929] rounded-lg border-2 border-[#F97316] p-1">
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
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Choose from our range of structured investment products
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-[#0A1929] rounded-xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-[#F97316]"
              >
                <div className="bg-gradient-to-r from-[#F97316] to-[#FB923C] px-4 py-3">
                  <h3 className="text-lg font-semibold text-white">{product.name}</h3>
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-400">Investment</span>
                    <div className="text-right">
                      <span className="font-bold text-white">{product.price}</span>
                      {showConverted && (
                        <div className="text-xs text-gray-500">
                          USD {new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: 'USD',
                            minimumFractionDigits: 0,
                          }).format(product.priceUSD)}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-400">Duration</span>
                    <span className="font-semibold text-white">{product.days} days</span>
                  </div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-gray-400">Return</span>
                    <span className="text-[#F97316] font-bold">{product.return}</span>
                  </div>
                  <Link
                    to="/products"
                    className="block text-center py-2 bg-[#030614] text-[#F97316] rounded-lg hover:bg-[#F97316] hover:text-white transition duration-300 border border-[#F97316]"
                  >
                    Learn More
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              to="/products"
              className="inline-flex items-center space-x-2 px-6 py-3 bg-[#F97316] text-white rounded-lg hover:bg-[#FB923C] transition duration-300 shadow-lg shadow-[#F97316]/20"
            >
              <span>View All Products</span>
              <ChevronRightIcon className="w-5 h-5" />
            </Link>
          </div>

          {/* Exchange Rate Info */}
          {showConverted && (
            <div className="mt-8 text-center text-sm text-gray-500">
              <p className="flex items-center justify-center gap-2">
                <span className="w-1 h-1 bg-[#F97316] rounded-full"></span>
                All prices shown in {currency.code} are converted from USD at rate 1 USD = {currency.exchangeRate} {currency.code}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Commission Structure */}
      <section className="py-20 bg-[#0A1929]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Build Your Team,
                <br />
                <span className="text-[#F97316]">Earn More Together</span>
              </h2>
              <p className="text-lg text-gray-400 mb-8">
                Our 3-level referral system rewards you for building a strong team:
              </p>

              <div className="space-y-4">
                <div className="flex items-center space-x-4 p-4 bg-[#030614] rounded-lg border-l-4 border-[#F97316]">
                  <div className="w-12 h-12 bg-[#F97316] rounded-full flex items-center justify-center text-white font-bold text-xl">
                    1
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Level 1 (Direct Referrals)</h3>
                    <p className="text-[#F97316] font-bold">10% Commission</p>
                    <p className="text-sm text-gray-400">Earn from people you directly invite</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 p-4 bg-[#030614] rounded-lg border-l-4 border-[#F97316]">
                  <div className="w-12 h-12 bg-[#F97316] rounded-full flex items-center justify-center text-white font-bold text-xl">
                    2
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Level 2 (Indirect)</h3>
                    <p className="text-[#F97316] font-bold">6% Commission</p>
                    <p className="text-sm text-gray-400">Earn from your referrals' referrals</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 p-4 bg-[#030614] rounded-lg border-l-4 border-[#F97316]">
                  <div className="w-12 h-12 bg-[#F97316] rounded-full flex items-center justify-center text-white font-bold text-xl">
                    3
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Level 3 (Third Level)</h3>
                    <p className="text-[#F97316] font-bold">3% Commission</p>
                    <p className="text-sm text-gray-400">Earn from the third level of your network</p>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <Link
                  to="/register"
                  className="inline-flex items-center space-x-2 px-6 py-3 bg-[#F97316] text-white rounded-lg hover:bg-[#FB923C] transition duration-300 shadow-lg shadow-[#F97316]/20"
                >
                  <span>Start Building Your Team</span>
                  <ChevronRightIcon className="w-5 h-5" />
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="relative"
            >
              <img
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
                alt="Team collaboration"
                className="rounded-xl shadow-2xl border-2 border-[#F97316]"
              />
              <div className="absolute -bottom-6 -right-6 w-48 h-48 bg-[#F97316] rounded-full opacity-10"></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-[#0A1929] to-[#030614] py-20 border-t-2 border-[#F97316]">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Start Your Investment Journey?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Join thousands of investors already growing their wealth with Afro Connect
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="px-8 py-3 bg-[#F97316] text-white rounded-lg font-semibold hover:bg-[#FB923C] transition duration-300 shadow-lg shadow-[#F97316]/20 border-2 border-white"
              >
                Create Free Account
              </Link>
              <Link
                to="/products"
                className="px-8 py-3 border-2 border-[#F97316] text-white rounded-lg font-semibold hover:bg-[#F97316] hover:text-white transition duration-300"
              >
                Browse Products
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;