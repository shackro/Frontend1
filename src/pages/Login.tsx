import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/common/Button';
import { EnvelopeIcon, LockClosedIcon } from '@heroicons/react/24/outline';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    try {
      await login(data.email, data.password);
      navigate('/dashboard');
    } catch (error) {
      // Error is handled in auth context
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen bg-[#0A1929] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-[#F97316] to-transparent opacity-10"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#F97316] rounded-full filter blur-3xl opacity-10"></div>
      <div className="absolute top-20 left-20 w-64 h-64 bg-[#F97316] rounded-full filter blur-3xl opacity-5"></div>

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
          Welcome back to Afro Connect
        </h2>
        <p className="mt-2 text-center text-sm text-gray-400">
          Don't have an account?{' '}
          <Link to="/register" className="font-medium text-[#F97316] hover:text-[#FB923C] transition">
            Sign up now
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
                <p className="mt-2 text-sm text-red-400">{errors.email.message}</p>
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
                <p className="mt-2 text-sm text-red-400">{errors.password.message}</p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-[#F97316] focus:ring-[#F97316] border-gray-600 rounded bg-[#030614]"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-300">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-[#F97316] hover:text-[#FB923C] transition">
                  Forgot your password?
                </a>
              </div>
            </div>

            <div>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                loading={loading}
              >
                Sign in
              </Button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-[#0A1929] text-gray-400">Investment Platform</span>
              </div>
            </div>

            <div className="mt-6 text-center text-sm text-gray-400">
              By signing in, you agree to our{' '}
              <a href="#" className="font-medium text-[#F97316] hover:text-[#FB923C] transition">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className="font-medium text-[#F97316] hover:text-[#FB923C] transition">
                Privacy Policy
              </a>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Footer Note */}
      <div className="mt-8 text-center text-sm text-gray-500 relative z-10">
        <p className="flex items-center justify-center gap-2">
          <span className="w-1 h-1 bg-[#F97316] rounded-full"></span>
          Secure login • 256-bit encryption
        </p>
      </div>
    </div>
  );
};

export default Login;