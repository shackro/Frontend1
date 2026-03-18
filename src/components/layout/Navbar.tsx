import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useCurrency } from '../../contexts/CurrencyContext';
import CurrencySelector from '../common/CurrencySelector';
import {
  HomeIcon,
  CubeIcon,
  UserGroupIcon,
  ChartBarIcon,
  ArrowRightOnRectangleIcon,
  UserCircleIcon,
  Bars3Icon,
  XMarkIcon,
  WalletIcon,
} from '@heroicons/react/24/outline';

// Import your logo image
import AfroConnectLogo from '../../assets/afrologo.jpeg'; // Adjust the path to your actual logo

const Navbar: React.FC = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { currency, convertAmount, formatAmount } = useCurrency();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  // Get user's preferred currency from their profile or use selected currency
  const getUserBalance = () => {
    if (!user?.balance) return 0;

    if (user.preferred_currency && user.preferred_currency !== currency.code) {
      return convertAmount(user.balance, 'USD', user.preferred_currency as any);
    }

    return convertAmount(user.balance, 'USD', currency.code);
  };

  const navLinks = [
    { name: 'Home', path: '/', icon: HomeIcon },
    { name: 'Products', path: '/products', icon: CubeIcon },
    ...(isAuthenticated ? [
      { name: 'Dashboard', path: '/dashboard', icon: ChartBarIcon },
      { name: 'Team', path: '/team', icon: UserGroupIcon },
    ] : []),
    ...(isAdmin ? [
      { name: 'Admin', path: '/admin', icon: UserCircleIcon },
    ] : []),
  ];

  const displayCurrency = user?.preferred_currency
    ? (user.preferred_currency as any)
    : currency.code;

  return (
    <nav className="bg-[#030614] shadow-xl fixed w-full z-50 border-b-2 border-[#F97316]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3 group">
              {/* Rounded full image logo */}
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#F97316] group-hover:border-[#FB923C] transition-all duration-300 shadow-lg shadow-[#F97316]/20">
                <img
                  src={AfroConnectLogo}
                  alt="Afro Connect Logo"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="font-bold text-xl text-white group-hover:text-[#F97316] transition duration-300">
                Afro Connect
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="flex items-center space-x-1 px-4 py-2 rounded-md text-sm font-medium text-gray-300 hover:text-[#F97316] hover:bg-[#0A1929] transition duration-300"
              >
                <link.icon className="w-4 h-4" />
                <span>{link.name}</span>
              </Link>
            ))}
          </div>

          {/* User menu - Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Currency Selector - Always visible */}
            <CurrencySelector />

            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center space-x-3 focus:outline-none group"
                >
                  <div className="text-right">
                    <div className="text-sm font-medium text-white">
                      {user?.first_name} {user?.last_name}
                    </div>
                    <div className="text-xs text-[#F97316]">
                      Balance: {formatAmount(getUserBalance(), displayCurrency)}
                    </div>
                  </div>
                  <div className="w-9 h-9 bg-[#0A1929] rounded-full flex items-center justify-center border-2 border-[#F97316] group-hover:border-[#FB923C] transition duration-300 overflow-hidden">
                    {user?.profile_picture ? (
                      <img
                        src={user.profile_picture}
                        alt={`${user.first_name} ${user.last_name}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <UserCircleIcon className="w-6 h-6 text-[#F97316]" />
                    )}
                  </div>
                </button>

                <AnimatePresence>
                  {showProfileMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-48 bg-[#0A1929] rounded-md shadow-xl py-1 border border-[#F97316]"
                    >
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-sm text-gray-300 hover:bg-[#F97316] hover:text-white transition duration-300"
                        onClick={() => setShowProfileMenu(false)}
                      >
                        Your Profile
                      </Link>
                      <Link
                        to="/transactions"
                        className="block px-4 py-2 text-sm text-gray-300 hover:bg-[#F97316] hover:text-white transition duration-300"
                        onClick={() => setShowProfileMenu(false)}
                      >
                        Wallet
                      </Link>
                      <Link
                        to="/investments"
                        className="block px-4 py-2 text-sm text-gray-300 hover:bg-[#F97316] hover:text-white transition duration-300"
                        onClick={() => setShowProfileMenu(false)}
                      >
                        Investments
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500 hover:text-white transition duration-300"
                      >
                        Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-[#F97316] transition duration-300"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-[#F97316] text-white text-sm font-medium rounded-lg hover:bg-[#FB923C] transition duration-300 shadow-lg shadow-[#F97316]/20"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            {/* Currency Selector for mobile */}
            <div className="w-24">
              <CurrencySelector />
            </div>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-300 hover:text-[#F97316] hover:bg-[#0A1929] focus:outline-none transition duration-300"
            >
              {isOpen ? (
                <XMarkIcon className="block h-6 w-6" />
              ) : (
                <Bars3Icon className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[#0A1929] border-t border-[#F97316]"
          >
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="flex items-center space-x-2 px-3 py-3 rounded-md text-base font-medium text-gray-300 hover:text-[#F97316] hover:bg-[#030614] transition duration-300"
                  onClick={() => setIsOpen(false)}
                >
                  <link.icon className="w-5 h-5" />
                  <span>{link.name}</span>
                </Link>
              ))}

              {isAuthenticated ? (
                <>
                  <div className="border-t border-gray-700 pt-2 mt-2">
                    <div className="px-3 py-2">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-[#030614] rounded-full overflow-hidden border-2 border-[#F97316]">
                          {user?.profile_picture ? (
                            <img
                              src={user.profile_picture}
                              alt={`${user.first_name} ${user.last_name}`}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <UserCircleIcon className="w-full h-full text-[#F97316]" />
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-white">
                            {user?.first_name} {user?.last_name}
                          </div>
                          <div className="text-xs text-[#F97316]">
                            Balance: {formatAmount(getUserBalance(), displayCurrency)}
                          </div>
                        </div>
                      </div>
                    </div>
                    <Link
                      to="/profile"
                      className="flex items-center space-x-2 px-3 py-3 rounded-md text-base font-medium text-gray-300 hover:text-[#F97316] hover:bg-[#030614] transition duration-300"
                      onClick={() => setIsOpen(false)}
                    >
                      <UserCircleIcon className="w-5 h-5" />
                      <span>Profile</span>
                    </Link>
                    <Link
                      to="/investments"
                      className="flex items-center space-x-2 px-3 py-3 rounded-md text-base font-medium text-gray-300 hover:text-[#F97316] hover:bg-[#030614] transition duration-300"
                      onClick={() => setIsOpen(false)}
                    >
                      <WalletIcon className="w-5 h-5" />
                      <span>Investments</span>
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsOpen(false);
                      }}
                      className="flex items-center space-x-2 w-full px-3 py-3 rounded-md text-base font-medium text-red-400 hover:bg-red-500 hover:text-white transition duration-300"
                    >
                      <ArrowRightOnRectangleIcon className="w-5 h-5" />
                      <span>Logout</span>
                    </button>
                  </div>
                </>
              ) : (
                <div className="border-t border-gray-700 pt-2 mt-2 space-y-2">
                  <Link
                    to="/login"
                    className="block px-3 py-3 text-center text-base font-medium text-gray-300 hover:text-[#F97316] hover:bg-[#030614] rounded-md transition duration-300"
                    onClick={() => setIsOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="block px-3 py-3 text-center bg-[#F97316] text-white text-base font-medium rounded-md hover:bg-[#FB923C] transition duration-300"
                    onClick={() => setIsOpen(false)}
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;