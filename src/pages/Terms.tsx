import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  DocumentTextIcon,
  ScaleIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  ClockIcon,
  DocumentCheckIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

const Terms: React.FC = () => {
  const sections = [
    {
      icon: <DocumentTextIcon className="w-6 h-6" />,
      title: '1. Acceptance of Terms',
      content: 'By accessing or using Afro Connect, you agree to be bound by these Terms and Conditions. If you do not agree to all the terms and conditions, you may not access or use our services. These terms constitute a legally binding agreement between you and Afro Connect.',
    },
    {
      icon: <UserGroupIcon className="w-6 h-6" />,
      title: '2. Eligibility',
      content: 'You must be at least 18 years old to use Afro Connect. By using our services, you represent and warrant that you have the right, authority, and capacity to enter into this agreement and to abide by all terms and conditions. Users must provide accurate and complete information during registration.',
    },
    {
      icon: <ScaleIcon className="w-6 h-6" />,
      title: '3. Account Registration',
      content: 'You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account. We reserve the right to suspend or terminate accounts that violate these terms.',
    },
    {
      icon: <CurrencyDollarIcon className="w-6 h-6" />,
      title: '4. Investment Products',
      content: 'Investment products offered on Afro Connect have specific terms, durations, and potential returns. All investments involve risk, and returns are not guaranteed. Past performance does not guarantee future results. Users should carefully review product details before investing.',
    },
    {
      icon: <ClockIcon className="w-6 h-6" />,
      title: '5. Deposits and Withdrawals',
      content: 'Deposits are processed instantly and credited to your available balance. Withdrawals are subject to review and approval, typically processed within 24-48 hours. We reserve the right to delay or refuse withdrawals that violate our policies or raise security concerns.',
    },
    {
      icon: <ShieldCheckIcon className="w-6 h-6" />,
      title: '6. Fees and Charges',
      content: 'Afro Connect may charge fees for certain services, including withdrawal processing fees. All applicable fees will be clearly displayed before you confirm any transaction. We reserve the right to modify our fee structure with prior notice.',
    },
    {
      icon: <UserGroupIcon className="w-6 h-6" />,
      title: '7. Referral Program',
      content: 'Our referral program allows users to earn commissions by inviting new users. Commissions are calculated based on the investment amounts of referred users. We reserve the right to modify or terminate the referral program at any time.',
    },
    {
      icon: <DocumentCheckIcon className="w-6 h-6" />,
      title: '8. KYC Verification',
      content: 'To comply with financial regulations, we require KYC (Know Your Customer) verification. Users must provide valid identification documents. Failure to complete KYC verification may result in restricted account access.',
    },
    {
      icon: <ExclamationTriangleIcon className="w-6 h-6" />,
      title: '9. Prohibited Activities',
      content: 'Users may not engage in fraudulent activities, money laundering, or any illegal practices. Multiple accounts, automated scripts, and abuse of the referral system are strictly prohibited. Violations will result in immediate account termination and possible legal action.',
    },
    {
      icon: <ScaleIcon className="w-6 h-6" />,
      title: '10. Limitation of Liability',
      content: 'Afro Connect shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of our services. In no event shall our total liability exceed the amount you have invested or deposited in the preceding 12 months.',
    },
    {
      icon: <DocumentTextIcon className="w-6 h-6" />,
      title: '11. Modifications to Terms',
      content: 'We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting. Your continued use of Afro Connect after changes constitutes acceptance of the modified terms.',
    },
    {
      icon: <ShieldCheckIcon className="w-6 h-6" />,
      title: '12. Governing Law',
      content: 'These terms shall be governed by and construed in accordance with the laws of Kenya. Any disputes arising under these terms shall be subject to the exclusive jurisdiction of the courts in Nairobi, Kenya.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#0A1929] pt-20 pb-12">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-[#0A1929] to-[#0F2744] text-white py-16 border-b-2 border-[#F97316]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Terms & Conditions</h1>
            <p className="text-xl max-w-3xl mx-auto text-gray-300">
              Please read these terms carefully before using Afro Connect
            </p>
            <p className="text-sm text-gray-400 mt-4">Last Updated: March 1, 2024</p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Summary Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-[#0A1929] rounded-xl shadow-xl p-6 mb-8 border-l-4 border-[#F97316] border-2 border-[#F97316] border-opacity-30"
        >
          <h2 className="text-lg font-semibold text-white mb-3">Quick Summary</h2>
          <ul className="space-y-2 text-sm text-gray-400">
            <li className="flex items-start">
              <span className="inline-block w-1.5 h-1.5 bg-[#F97316] rounded-full mt-1.5 mr-2"></span>
              <span>Users must be at least 18 years old</span>
            </li>
            <li className="flex items-start">
              <span className="inline-block w-1.5 h-1.5 bg-[#F97316] rounded-full mt-1.5 mr-2"></span>
              <span>Investments involve risk - returns are not guaranteed</span>
            </li>
            <li className="flex items-start">
              <span className="inline-block w-1.5 h-1.5 bg-[#F97316] rounded-full mt-1.5 mr-2"></span>
              <span>KYC verification is required for compliance</span>
            </li>
            <li className="flex items-start">
              <span className="inline-block w-1.5 h-1.5 bg-[#F97316] rounded-full mt-1.5 mr-2"></span>
              <span>Withdrawals are processed within 24-48 hours</span>
            </li>
            <li className="flex items-start">
              <span className="inline-block w-1.5 h-1.5 bg-[#F97316] rounded-full mt-1.5 mr-2"></span>
              <span>Fraudulent activity will result in account termination</span>
            </li>
          </ul>
        </motion.div>

        {/* Terms Sections */}
        <div className="space-y-6">
          {sections.map((section, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              className="bg-[#0A1929] rounded-xl shadow-xl p-6 hover:shadow-2xl transition-all duration-300 border-2 border-[#F97316] border-opacity-30 hover:border-opacity-100"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-[#030614] rounded-lg flex items-center justify-center text-[#F97316] flex-shrink-0 border border-[#F97316]">
                  {section.icon}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">{section.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{section.content}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Additional Info - Risk Warning */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-8 bg-[#0A1929] rounded-xl p-6 border-2 border-yellow-500 border-opacity-50"
        >
          <div className="flex items-start gap-3">
            <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-yellow-500 mb-2">Risk Warning</h4>
              <p className="text-sm text-gray-400">
                Participation in Afro Connect involves financial risk. Users should carefully evaluate their financial situation before participating. Afro Connect does not offer guaranteed returns, fixed income, or risk-free investment products. Only funds that users can afford to lose should be used for participation. Past performance does not guarantee future results.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Contact for Questions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="mt-8 text-center"
        >
          <p className="text-gray-400">
            Have questions about our terms?{' '}
            <Link to="/contact" className="text-[#F97316] hover:text-[#FB923C] font-medium transition">
              Contact our support team
            </Link>
          </p>
        </motion.div>

        {/* Decorative Element */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#F97316] rounded-full filter blur-3xl opacity-5 pointer-events-none"></div>
      </div>
    </div>
  );
};

export default Terms;