import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/common/Button';
import {
  UserIcon,
  EnvelopeIcon,
  LockClosedIcon,
  PhoneIcon,
  GiftIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const registerSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Invalid email address'),
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  phone_number: z.string().min(10, 'Valid phone number is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  password2: z.string().min(8, 'Confirm password is required'),
  referral_code: z.string().optional(),
}).refine((data) => data.password === data.password2, {
  message: "Passwords don't match",
  path: ["password2"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register: registerUser } = useAuth();
  const [loading, setLoading] = useState(false);

  // Get referral code from URL if present
  const urlParams = new URLSearchParams(window.location.search);
  const referralCodeFromUrl = urlParams.get('ref');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      referral_code: referralCodeFromUrl || '',
    },
  });

  // Set referral code from URL if present
  useEffect(() => {
    if (referralCodeFromUrl) {
      setValue('referral_code', referralCodeFromUrl);
    }
  }, [referralCodeFromUrl, setValue]);

  const onSubmit = async (data: RegisterFormData) => {
    setLoading(true);
    try {
      await registerUser(data);
      toast.success('Registration successful! Welcome to Afro Connect!', {
        style: {
          background: '#0A1929',
          color: '#F97316',
          border: '1px solid #F97316',
        },
        iconTheme: {
          primary: '#F97316',
          secondary: '#0A1929',
        },
      });
      navigate('/dashboard');
    } catch (error: any) {
      if (error.response?.data) {
        // Handle field errors from backend
        Object.keys(error.response.data).forEach((key) => {
          toast.error(`${key}: ${error.response.data[key]}`, {
            style: {
              background: '#0A1929',
              color: '#F97316',
              border: '1px solid #DC2626',
            },
          });
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen bg-[#0A1929] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-[#F97316] to-transparent opacity-10"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#F97316] rounded-full filter blur-3xl opacity-10"></div>
      <div className="absolute top-20 right-20 w-64 h-64 bg-[#F97316] rounded-full filter blur-3xl opacity-5"></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="sm:mx-auto sm:w-full sm:max-w-md relative z-10"
      >
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-gradient-to-br from-[#F97316] to-[#FB923C] rounded-2xl flex items-center justify-center shadow-xl shadow-[#F97316]/20 border-2 border-white">
            <span className="text-white font-bold text-4xl">A</span>
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-400">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-[#F97316] hover:text-[#FB923C] transition">
            Sign in
          </Link>
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10"
      >
        <div className="bg-[#0A1929] py-8 px-4 shadow-2xl rounded-lg sm:px-10 border-2 border-[#F97316] border-opacity-30">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="first_name" className="block text-sm font-medium text-gray-300">
                  First Name
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserIcon className="h-5 w-5 text-[#F97316]" />
                  </div>
                  <input
                    id="first_name"
                    type="text"
                    {...register('first_name')}
                    className="appearance-none block w-full pl-10 px-3 py-3 bg-[#030614] border-2 border-gray-700 text-white rounded-lg shadow-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#F97316] focus:border-transparent transition duration-300"
                    placeholder="John"
                  />
                </div>
                {errors.first_name && (
                  <p className="mt-1 text-xs text-red-400">{errors.first_name.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="last_name" className="block text-sm font-medium text-gray-300">
                  Last Name
                </label>
                <div className="mt-1">
                  <input
                    id="last_name"
                    type="text"
                    {...register('last_name')}
                    className="appearance-none block w-full px-3 py-3 bg-[#030614] border-2 border-gray-700 text-white rounded-lg shadow-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#F97316] focus:border-transparent transition duration-300"
                    placeholder="Doe"
                  />
                </div>
                {errors.last_name && (
                  <p className="mt-1 text-xs text-red-400">{errors.last_name.message}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-300">
                Username
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserIcon className="h-5 w-5 text-[#F97316]" />
                </div>
                <input
                  id="username"
                  type="text"
                  {...register('username')}
                  className="appearance-none block w-full pl-10 px-3 py-3 bg-[#030614] border-2 border-gray-700 text-white rounded-lg shadow-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#F97316] focus:border-transparent transition duration-300"
                  placeholder="johndoe"
                />
              </div>
              {errors.username && (
                <p className="mt-1 text-xs text-red-400">{errors.username.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                Email address
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <EnvelopeIcon className="h-5 w-5 text-[#F97316]" />
                </div>
                <input
                  id="email"
                  type="email"
                  {...register('email')}
                  className="appearance-none block w-full pl-10 px-3 py-3 bg-[#030614] border-2 border-gray-700 text-white rounded-lg shadow-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#F97316] focus:border-transparent transition duration-300"
                  placeholder="you@example.com"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="phone_number" className="block text-sm font-medium text-gray-300">
                Phone Number
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <PhoneIcon className="h-5 w-5 text-[#F97316]" />
                </div>
                <input
                  id="phone_number"
                  type="tel"
                  {...register('phone_number')}
                  className="appearance-none block w-full pl-10 px-3 py-3 bg-[#030614] border-2 border-gray-700 text-white rounded-lg shadow-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#F97316] focus:border-transparent transition duration-300"
                  placeholder="+1234567890"
                />
              </div>
              {errors.phone_number && (
                <p className="mt-1 text-xs text-red-400">{errors.phone_number.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                Password
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockClosedIcon className="h-5 w-5 text-[#F97316]" />
                </div>
                <input
                  id="password"
                  type="password"
                  {...register('password')}
                  className="appearance-none block w-full pl-10 px-3 py-3 bg-[#030614] border-2 border-gray-700 text-white rounded-lg shadow-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#F97316] focus:border-transparent transition duration-300"
                  placeholder="••••••••"
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password2" className="block text-sm font-medium text-gray-300">
                Confirm Password
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockClosedIcon className="h-5 w-5 text-[#F97316]" />
                </div>
                <input
                  id="password2"
                  type="password"
                  {...register('password2')}
                  className="appearance-none block w-full pl-10 px-3 py-3 bg-[#030614] border-2 border-gray-700 text-white rounded-lg shadow-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#F97316] focus:border-transparent transition duration-300"
                  placeholder="••••••••"
                />
              </div>
              {errors.password2 && (
                <p className="mt-1 text-xs text-red-400">{errors.password2.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="referral_code" className="block text-sm font-medium text-gray-300">
                Referral Code (Optional)
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <GiftIcon className="h-5 w-5 text-[#F97316]" />
                </div>
                <input
                  id="referral_code"
                  type="text"
                  {...register('referral_code')}
                  className="appearance-none block w-full pl-10 px-3 py-3 bg-[#030614] border-2 border-gray-700 text-white rounded-lg shadow-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#F97316] focus:border-transparent transition duration-300"
                  placeholder="Enter referral code"
                />
              </div>
              {errors.referral_code && (
                <p className="mt-1 text-xs text-red-400">{errors.referral_code.message}</p>
              )}
            </div>

            <div>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                loading={loading}
              >
                Create Account
              </Button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-[#0A1929] text-gray-400">
                  Join our investment community
                </span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3">
              <div className="text-center p-3 bg-[#030614] rounded-lg border border-[#F97316] border-opacity-30">
                <p className="text-sm font-bold text-[#F97316]">10%</p>
                <p className="text-xs text-gray-400">Level 1</p>
              </div>
              <div className="text-center p-3 bg-[#030614] rounded-lg border border-[#F97316] border-opacity-30">
                <p className="text-sm font-bold text-[#F97316]">6%</p>
                <p className="text-xs text-gray-400">Level 2</p>
              </div>
              <div className="text-center p-3 bg-[#030614] rounded-lg border border-[#F97316] border-opacity-30">
                <p className="text-sm font-bold text-[#F97316]">3%</p>
                <p className="text-xs text-gray-400">Level 3</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Footer Note */}
      <div className="mt-8 text-center text-sm text-gray-500 relative z-10">
        <p className="flex items-center justify-center gap-2">
          <span className="w-1 h-1 bg-[#F97316] rounded-full"></span>
          By signing up, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
};

export default Register;