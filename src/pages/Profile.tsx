// frontend/src/pages/Profile.tsx

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useCurrency } from '../contexts/CurrencyContext';
import api from '../services/api';
import Loader from '../components/common/Loader';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import {
    UserCircleIcon,
    EnvelopeIcon,
    PhoneIcon,
//     CalendarIcon,
//     IdentificationIcon,
//     CurrencyDollarIcon,
    CameraIcon,
    PencilIcon,
    CheckBadgeIcon,
    XMarkIcon,
    ArrowUpTrayIcon,
    DocumentTextIcon,
    ClockIcon,
} from '@heroicons/react/24/outline';
// import { CheckIcon } from '@heroicons/react/20/solid';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { User } from '../types';

// Form validation schemas
const personalInfoSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  phone_number: z.string().min(10, 'Valid phone number is required'),
  email: z.string().email('Invalid email address'),
});

const passwordSchema = z.object({
  current_password: z.string().min(6, 'Current password is required'),
  new_password: z.string().min(8, 'New password must be at least 8 characters'),
  confirm_password: z.string().min(8, 'Please confirm your password'),
}).refine((data) => data.new_password === data.confirm_password, {
  message: "Passwords don't match",
  path: ["confirm_password"],
});

type PersonalInfoFormData = z.infer<typeof personalInfoSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

const Profile: React.FC = () => {
  const { user, updateUser, logout } = useAuth();
  const { currency, setCurrency, availableCurrencies } = useCurrency();
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showKYCModal, setShowKYCModal] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [kycStatus, setKycStatus] = useState<'pending' | 'verified' | 'rejected' | 'not_submitted'>(
    user?.is_kyc_verified ? 'verified' : 'not_submitted'
  );

  // Personal info form
  const {
    register: registerPersonal,
    handleSubmit: handleSubmitPersonal,
    formState: { errors: personalErrors, isDirty },
    reset: resetPersonal,
  } = useForm<PersonalInfoFormData>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      phone_number: user?.phone_number || '',
      email: user?.email || '',
    },
  });

  // Password change form
  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors },
    reset: resetPassword,
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  // KYC form state
  const [kycDocuments, setKycDocuments] = useState<{
    idType: 'passport' | 'national_id' | 'drivers_license';
    idNumber: string;
    frontImage: File | null;
    backImage: File | null;
    selfie: File | null;
  }>({
    idType: 'passport',
    idNumber: '',
    frontImage: null,
    backImage: null,
    selfie: null,
  });

  useEffect(() => {
    // Load user's profile image if exists
    if (user?.profile?.profile_picture) {
      setProfileImage(user.profile.profile_picture);
    }
  }, [user]);

  const onPersonalInfoSubmit = async (data: PersonalInfoFormData) => {
    setLoading(true);
    try {
      const response = await api.updateProfile(data);
      updateUser({ ...user, ...data } as User);
      toast.success('Profile updated successfully', {
        style: {
          background: '#0A1929',
          color: '#F97316',
          border: '1px solid #F97316',
        },
      });
      setIsEditing(false);
    } catch (error) {
      toast.error('Failed to update profile', {
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

  const onPasswordSubmit = async (data: PasswordFormData) => {
    setLoading(true);
    try {
      await api.changePassword(data);
      toast.success('Password changed successfully', {
        style: {
          background: '#0A1929',
          color: '#F97316',
          border: '1px solid #F97316',
        },
      });
      setShowPasswordModal(false);
      resetPassword();
    } catch (error) {
      toast.error('Failed to change password', {
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

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB', {
        style: {
          background: '#0A1929',
          color: '#F97316',
          border: '1px solid #DC2626',
        },
      });
      return;
    }

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('profile_picture', file);

      const response = await api.uploadProfilePicture(formData);
      setProfileImage(URL.createObjectURL(file));
      toast.success('Profile picture updated', {
        style: {
          background: '#0A1929',
          color: '#F97316',
          border: '1px solid #F97316',
        },
      });
    } catch (error) {
      toast.error('Failed to upload image', {
        style: {
          background: '#0A1929',
          color: '#F97316',
          border: '1px solid #DC2626',
        },
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleKYCSubmit = async () => {
    if (!kycDocuments.frontImage || !kycDocuments.backImage || !kycDocuments.selfie) {
      toast.error('Please upload all required documents', {
        style: {
          background: '#0A1929',
          color: '#F97316',
          border: '1px solid #DC2626',
        },
      });
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('id_type', kycDocuments.idType);
      formData.append('id_number', kycDocuments.idNumber);
      formData.append('front_image', kycDocuments.frontImage);
      formData.append('back_image', kycDocuments.backImage);
      formData.append('selfie', kycDocuments.selfie);

      await api.submitKYC(formData);
      setKycStatus('pending');
      setShowKYCModal(false);
      toast.success('KYC documents submitted successfully', {
        style: {
          background: '#0A1929',
          color: '#F97316',
          border: '1px solid #F97316',
        },
      });
    } catch (error) {
      toast.error('Failed to submit KYC', {
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getKYCStatusBadge = () => {
    switch (kycStatus) {
      case 'verified':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-500 bg-opacity-20 text-green-500 border border-green-500">
            <CheckBadgeIcon className="w-4 h-4 mr-1" />
            Verified
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-500 bg-opacity-20 text-yellow-500 border border-yellow-500">
            <ClockIcon className="w-4 h-4 mr-1" />
            Pending Verification
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-500 bg-opacity-20 text-red-500 border border-red-500">
            <XMarkIcon className="w-4 h-4 mr-1" />
            Rejected
          </span>
        );
      default:
        return (
          <button
            onClick={() => setShowKYCModal(true)}
            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[#F97316] bg-opacity-20 text-[#F97316] border border-[#F97316] hover:bg-[#F97316] hover:text-white transition"
          >
            <DocumentTextIcon className="w-4 h-4 mr-1" />
            Submit KYC
          </button>
        );
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen bg-[#0A1929] pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white">My Profile</h1>
            <p className="text-gray-400 mt-2">
              Manage your personal information and account settings
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Profile Picture & Summary */}
            <div className="lg:col-span-1">
              <div className="bg-[#0A1929] rounded-2xl shadow-xl p-6 sticky top-24 border-2 border-[#F97316] border-opacity-30">
                {/* Profile Image */}
                <div className="relative flex justify-center mb-6">
                  <div className="relative">
                    <div className="w-32 h-32 rounded-full bg-gradient-to-r from-[#F97316] to-[#FB923C] flex items-center justify-center overflow-hidden border-4 border-[#F97316]">
                      {profileImage ? (
                        <img
                          src={profileImage}
                          alt={user?.first_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <UserCircleIcon className="w-20 h-20 text-white" />
                      )}
                    </div>
                    <label
                      htmlFor="profile-image-upload"
                      className="absolute bottom-0 right-0 bg-[#F97316] text-white p-2 rounded-full cursor-pointer hover:bg-[#FB923C] transition shadow-lg border-2 border-white"
                    >
                      <CameraIcon className="w-4 h-4" />
                      <input
                        type="file"
                        id="profile-image-upload"
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={uploadingImage}
                      />
                    </label>
                    {uploadingImage && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                        <Loader size="small" />
                      </div>
                    )}
                  </div>
                </div>

                {/* User Name & Title */}
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-white">
                    {user?.first_name} {user?.last_name}
                  </h2>
                  <p className="text-gray-400">@{user?.username}</p>
                </div>

                {/* Quick Stats */}
                <div className="border-t border-gray-700 pt-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Member Since</span>
                    <span className="font-medium text-white">
                      {user?.created_at ? formatDate(user.created_at) : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Referral Code</span>
                    <div className="flex items-center gap-2">
                      <code className="bg-[#030614] px-2 py-1 rounded text-sm font-mono text-[#F97316] border border-[#F97316]">
                        {user?.referral_code}
                      </code>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(user?.referral_code || '');
                          toast.success('Referral code copied!', {
                            style: {
                              background: '#0A1929',
                              color: '#F97316',
                              border: '1px solid #F97316',
                            },
                          });
                        }}
                        className="text-[#F97316] hover:text-[#FB923C] transition"
                      >
                        <DocumentTextIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">KYC Status</span>
                    {getKYCStatusBadge()}
                  </div>
                </div>

                {/* Account Actions */}
                <div className="border-t border-gray-700 pt-6 mt-6 space-y-3">
                  <button
                    onClick={() => setShowPasswordModal(true)}
                    className="w-full px-4 py-2 text-sm font-medium text-[#F97316] bg-[#030614] rounded-lg hover:bg-[#F97316] hover:text-white transition border border-[#F97316]"
                  >
                    Change Password
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-sm font-medium text-red-400 bg-red-500 bg-opacity-10 rounded-lg hover:bg-red-500 hover:text-white transition border border-red-500"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column - Detailed Information */}
            <div className="lg:col-span-2 space-y-6">
              {/* Personal Information Card */}
              <div className="bg-[#0A1929] rounded-2xl shadow-xl p-6 border-2 border-[#F97316] border-opacity-30">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-semibold text-white">Personal Information</h3>
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#F97316] bg-[#030614] rounded-lg hover:bg-[#F97316] hover:text-white transition border border-[#F97316]"
                    >
                      <PencilIcon className="w-4 h-4" />
                      Edit Profile
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        resetPersonal();
                      }}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-400 bg-[#030614] rounded-lg hover:bg-gray-700 hover:text-white transition border border-gray-700"
                    >
                      <XMarkIcon className="w-4 h-4" />
                      Cancel
                    </button>
                  )}
                </div>

                {isEditing ? (
                  <form onSubmit={handleSubmitPersonal(onPersonalInfoSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          First Name
                        </label>
                        <input
                          type="text"
                          {...registerPersonal('first_name')}
                          className="w-full px-4 py-2 bg-[#030614] border-2 border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-[#F97316] focus:border-transparent transition"
                        />
                        {personalErrors.first_name && (
                          <p className="mt-1 text-xs text-red-400">{personalErrors.first_name.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Last Name
                        </label>
                        <input
                          type="text"
                          {...registerPersonal('last_name')}
                          className="w-full px-4 py-2 bg-[#030614] border-2 border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-[#F97316] focus:border-transparent transition"
                        />
                        {personalErrors.last_name && (
                          <p className="mt-1 text-xs text-red-400">{personalErrors.last_name.message}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Email Address
                      </label>
                      <div className="relative">
                        <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#F97316]" />
                        <input
                          type="email"
                          {...registerPersonal('email')}
                          className="w-full pl-10 pr-4 py-2 bg-[#030614] border-2 border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-[#F97316] focus:border-transparent transition"
                        />
                      </div>
                      {personalErrors.email && (
                        <p className="mt-1 text-xs text-red-400">{personalErrors.email.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Phone Number
                      </label>
                      <div className="relative">
                        <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#F97316]" />
                        <input
                          type="tel"
                          {...registerPersonal('phone_number')}
                          className="w-full pl-10 pr-4 py-2 bg-[#030614] border-2 border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-[#F97316] focus:border-transparent transition"
                        />
                      </div>
                      {personalErrors.phone_number && (
                        <p className="mt-1 text-xs text-red-400">{personalErrors.phone_number.message}</p>
                      )}
                    </div>

                    <div className="flex gap-4 pt-4">
                      <Button
                        type="submit"
                        variant="primary"
                        loading={loading}
                        disabled={!isDirty}
                      >
                        Save Changes
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-400">First Name</p>
                        <p className="text-lg font-medium text-white">{user?.first_name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Last Name</p>
                        <p className="text-lg font-medium text-white">{user?.last_name}</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-gray-400">Email Address</p>
                      <p className="text-lg font-medium text-white">{user?.email}</p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-400">Phone Number</p>
                      <p className="text-lg font-medium text-white">{user?.phone_number || 'Not provided'}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Preferences Card */}
              <div className="bg-[#0A1929] rounded-2xl shadow-xl p-6 border-2 border-[#F97316] border-opacity-30">
                <h3 className="text-xl font-semibold text-white mb-6">Preferences</h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Preferred Currency
                    </label>
                    <div className="relative w-64">
                      <select
                        value={currency.code}
                        onChange={(e) => setCurrency(e.target.value as any)}
                        className="w-full px-4 py-2 bg-[#030614] border-2 border-[#F97316] text-white rounded-lg focus:ring-2 focus:ring-[#F97316] focus:border-transparent appearance-none cursor-pointer"
                      >
                        {availableCurrencies.map((curr: any) => (
                          <option key={curr.code} value={curr.code} className="bg-[#0A1929]">
                            {curr.flag} {curr.code} - {curr.symbol} ({curr.name})
                          </option>
                        ))}
                      </select>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      This will be your default currency for displaying amounts
                    </p>
                  </div>

                  <div className="pt-4 border-t border-gray-700">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-[#F97316] bg-[#030614] border-gray-600 rounded focus:ring-[#F97316]"
                        defaultChecked={user?.profile?.two_factor_enabled}
                      />
                      <span className="text-sm text-gray-300">Enable Two-Factor Authentication</span>
                    </label>
                    <p className="text-sm text-gray-500 mt-1 ml-7">
                      Add an extra layer of security to your account
                    </p>
                  </div>

                  <div className="pt-4">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-[#F97316] bg-[#030614] border-gray-600 rounded focus:ring-[#F97316]"
                        defaultChecked
                      />
                      <span className="text-sm text-gray-300">Receive email notifications</span>
                    </label>
                    <p className="text-sm text-gray-500 mt-1 ml-7">
                      Get updates about your investments and team activity
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Change Password Modal */}
      <Modal
        isOpen={showPasswordModal}
        onClose={() => {
          setShowPasswordModal(false);
          resetPassword();
        }}
        title="Change Password"
        size="md"
      >
        <form onSubmit={handleSubmitPassword(onPasswordSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Current Password
            </label>
            <input
              type="password"
              {...registerPassword('current_password')}
              className="w-full px-4 py-2 bg-[#030614] border-2 border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-[#F97316] focus:border-transparent transition"
            />
            {passwordErrors.current_password && (
              <p className="mt-1 text-xs text-red-400">{passwordErrors.current_password.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              New Password
            </label>
            <input
              type="password"
              {...registerPassword('new_password')}
              className="w-full px-4 py-2 bg-[#030614] border-2 border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-[#F97316] focus:border-transparent transition"
            />
            {passwordErrors.new_password && (
              <p className="mt-1 text-xs text-red-400">{passwordErrors.new_password.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Confirm New Password
            </label>
            <input
              type="password"
              {...registerPassword('confirm_password')}
              className="w-full px-4 py-2 bg-[#030614] border-2 border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-[#F97316] focus:border-transparent transition"
            />
            {passwordErrors.confirm_password && (
              <p className="mt-1 text-xs text-red-400">{passwordErrors.confirm_password.message}</p>
            )}
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="submit" variant="primary" loading={loading} fullWidth>
              Change Password
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setShowPasswordModal(false);
                resetPassword();
              }}
              fullWidth
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>

      {/* KYC Modal */}
      <Modal
        isOpen={showKYCModal}
        onClose={() => setShowKYCModal(false)}
        title="Verify Your Identity"
        size="lg"
      >
        <div className="space-y-6">
          <div className="bg-[#030614] p-4 rounded-lg border border-[#F97316]">
            <p className="text-sm text-[#F97316]">
              To comply with regulations and ensure platform security, we need to verify your identity.
              Please provide the following documents:
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              ID Type
            </label>
            <select
              value={kycDocuments.idType}
              onChange={(e) => setKycDocuments({ ...kycDocuments, idType: e.target.value as any })}
              className="w-full px-4 py-2 bg-[#030614] border-2 border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-[#F97316] focus:border-transparent transition"
            >
              <option value="passport" className="bg-[#0A1929]">Passport</option>
              <option value="national_id" className="bg-[#0A1929]">National ID Card</option>
              <option value="drivers_license" className="bg-[#0A1929]">Driver's License</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              ID Number
            </label>
            <input
              type="text"
              value={kycDocuments.idNumber}
              onChange={(e) => setKycDocuments({ ...kycDocuments, idNumber: e.target.value })}
              className="w-full px-4 py-2 bg-[#030614] border-2 border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-[#F97316] focus:border-transparent transition"
              placeholder="Enter your ID number"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Front of ID
              </label>
              <div className="border-2 border-dashed border-[#F97316] rounded-lg p-4 text-center hover:border-[#FB923C] transition bg-[#030614]">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setKycDocuments({
                    ...kycDocuments,
                    frontImage: e.target.files?.[0] || null
                  })}
                  className="hidden"
                  id="front-id"
                />
                <label htmlFor="front-id" className="cursor-pointer">
                  <ArrowUpTrayIcon className="w-8 h-8 mx-auto text-[#F97316] mb-2" />
                  <p className="text-sm text-gray-400">
                    {kycDocuments.frontImage ? kycDocuments.frontImage.name : 'Click to upload'}
                  </p>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Back of ID
              </label>
              <div className="border-2 border-dashed border-[#F97316] rounded-lg p-4 text-center hover:border-[#FB923C] transition bg-[#030614]">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setKycDocuments({
                    ...kycDocuments,
                    backImage: e.target.files?.[0] || null
                  })}
                  className="hidden"
                  id="back-id"
                />
                <label htmlFor="back-id" className="cursor-pointer">
                  <ArrowUpTrayIcon className="w-8 h-8 mx-auto text-[#F97316] mb-2" />
                  <p className="text-sm text-gray-400">
                    {kycDocuments.backImage ? kycDocuments.backImage.name : 'Click to upload'}
                  </p>
                </label>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Selfie with ID
            </label>
            <div className="border-2 border-dashed border-[#F97316] rounded-lg p-4 text-center hover:border-[#FB923C] transition bg-[#030614]">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setKycDocuments({
                  ...kycDocuments,
                  selfie: e.target.files?.[0] || null
                })}
                className="hidden"
                id="selfie"
              />
              <label htmlFor="selfie" className="cursor-pointer">
                <ArrowUpTrayIcon className="w-8 h-8 mx-auto text-[#F97316] mb-2" />
                <p className="text-sm text-gray-400">
                  {kycDocuments.selfie ? kycDocuments.selfie.name : 'Take or upload a selfie holding your ID'}
                </p>
              </label>
            </div>
          </div>

          <div className="bg-yellow-500 bg-opacity-10 p-4 rounded-lg border border-yellow-500">
            <p className="text-sm text-yellow-400">
              <strong>Note:</strong> Your documents will be securely stored and only used for verification purposes.
              They will be deleted after verification is complete.
            </p>
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              onClick={handleKYCSubmit}
              variant="primary"
              loading={loading}
              fullWidth
              disabled={!kycDocuments.frontImage || !kycDocuments.backImage || !kycDocuments.selfie || !kycDocuments.idNumber}
            >
              Submit for Verification
            </Button>
            <Button
              onClick={() => setShowKYCModal(false)}
              variant="secondary"
              fullWidth
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Profile;