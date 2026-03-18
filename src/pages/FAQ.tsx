import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ChevronDownIcon,
  QuestionMarkCircleIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  ClockIcon,
  BanknotesIcon,
  PhoneIcon,
  EnvelopeIcon,
} from '@heroicons/react/24/outline';

const FAQ: React.FC = () => {
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [openQuestion, setOpenQuestion] = useState<string | null>(null);

  const faqCategories = [
    {
      id: 'general',
      name: 'General Questions',
      icon: <QuestionMarkCircleIcon className="w-6 h-6" />,
      questions: [
        {
          id: 'what-is',
          question: 'What is Afro Connect?',
          answer: 'Afro Connect is a modern digital investment platform designed to provide structured earning opportunities through innovative financial products and collaborative participation. Users can generate income through product revenue, team growth, and referral bonuses, all within clearly defined timeframes and conditions.'
        },
        {
          id: 'how-it-works',
          question: 'How does Afro Connect work?',
          answer: 'Afro Connect works through three main income streams: 1) Product Revenue - Invest in time-based products with fixed durations and returns, 2) Team Income - Build a team and earn commissions from their investments (10%, 6%, and 3% across three levels), and 3) Referral Bonuses - Earn rewards for inviting new users to the platform.'
        },
        {
          id: 'who-can-join',
          question: 'Who can join Afro Connect?',
          answer: 'Anyone who is at least 18 years old can join Afro Connect. The platform is designed for both beginners and experienced investors looking for structured investment opportunities with clear timelines and community-driven growth.'
        },
        {
          id: 'legal',
          question: 'Is Afro Connect regulated?',
          answer: 'Afro Connect operates as a digital investment platform. Users should be aware that participation involves risk and returns are not guaranteed. We recommend consulting with a financial advisor before investing. The platform complies with applicable laws and regulations in the jurisdictions where it operates.'
        }
      ]
    },
    {
      id: 'investments',
      name: 'Investments & Products',
      icon: <CurrencyDollarIcon className="w-6 h-6" />,
      questions: [
        {
          id: 'product-types',
          question: 'What types of investment products are available?',
          answer: 'We offer a range of investment products from OMD Spark (starting at $1,500) to OMD Legend (up to $35,000). Each product has different durations (25-36 days), daily returns, and commission structures. All products are designed with transparent terms and clearly defined timelines.'
        },
        {
          id: 'minimum-investment',
          question: 'What is the minimum investment amount?',
          answer: 'The minimum investment varies by product. Our entry-level product, OMD Spark, starts at $1,500 USD (approximately 195,000 KES). For local currency investments, the minimum deposit is 450 KES, $3.50 USD, or €3.20 EUR.'
        },
        {
          id: 'returns-calculated',
          question: 'How are returns calculated?',
          answer: 'Returns are calculated based on the product\'s daily income rate multiplied by the investment amount and duration. For example, if you invest in a product with a 1% daily return for 30 days, your total return would be 30% of your investment. All calculations are transparent and visible before you invest.'
        },
        {
          id: 'withdraw-profits',
          question: 'Can I withdraw my profits anytime?',
          answer: 'Profits from completed investments can be withdrawn at any time. For active investments, daily earnings accumulate and are added to your balance, which can be withdrawn according to platform policies. Withdrawal requests are typically processed within 24-48 hours.'
        }
      ]
    },
    {
      id: 'team',
      name: 'Team & Referrals',
      icon: <UserGroupIcon className="w-6 h-6" />,
      questions: [
        {
          id: 'team-income',
          question: 'How does team income work?',
          answer: 'Team income is earned through our 3-level referral system: Level 1 (Direct Referrals): 10% commission, Level 2 (Referrals of your referrals): 6% commission, Level 3 (Third level): 3% commission. Commissions are calculated based on your team members\' investment amounts.'
        },
        {
          id: 'build-team',
          question: 'How do I build my team?',
          answer: 'You can build your team by sharing your unique referral link with friends, family, and colleagues. When they register using your link, they become your direct referrals. As they invite others, you earn commissions from multiple levels.'
        },
        {
          id: 'commission-payment',
          question: 'When are commissions paid?',
          answer: 'Commissions are calculated in real-time and added to your pending commission balance. They are paid out according to the platform\'s schedule, typically within 24-48 hours after the investment is made.'
        }
      ]
    },
    {
      id: 'security',
      name: 'Security & Trust',
      icon: <ShieldCheckIcon className="w-6 h-6" />,
      questions: [
        {
          id: 'data-security',
          question: 'How is my data protected?',
          answer: 'We use industry-standard encryption and security measures to protect your personal and financial information. All transactions are secure, and we never share your data with third parties without your consent.'
        },
        {
          id: 'kyc-verification',
          question: 'Why do you need KYC verification?',
          answer: 'KYC (Know Your Customer) verification is required to comply with financial regulations and prevent fraud. It helps us verify your identity, ensure platform security, and protect all users. The process is quick and secure.'
        },
        {
          id: 'investment-risk',
          question: 'Are my investments safe?',
          answer: 'While we implement robust security measures, all investments carry inherent risk. Returns are not guaranteed, and past performance does not indicate future results. We recommend only investing what you can afford to lose and diversifying your portfolio.'
        }
      ]
    },
    {
      id: 'payments',
      name: 'Payments & Withdrawals',
      icon: <BanknotesIcon className="w-6 h-6" />,
      questions: [
        {
          id: 'payment-methods',
          question: 'What payment methods are accepted?',
          answer: 'We accept multiple payment methods including Bank Transfer, M-Pesa, Credit Card, and Cryptocurrency. All deposits are processed instantly and your balance is updated immediately.'
        },
        {
          id: 'withdrawal-time',
          question: 'How long do withdrawals take?',
          answer: 'Withdrawal requests are typically processed within 24-48 hours. The amount is deducted from your balance immediately upon request, and once approved by our admin team, the funds are sent to your designated account.'
        },
        {
          id: 'fees',
          question: 'Are there any fees?',
          answer: 'Deposits are free. Withdrawals may incur a small processing fee depending on the payment method. All fees are clearly displayed before you confirm any transaction.'
        },
        {
          id: 'currency-support',
          question: 'What currencies are supported?',
          answer: 'We support USD, KES (Kenyan Shilling), and EUR. You can switch between currencies at any time using the currency selector in the navigation bar. All amounts are converted in real-time using current exchange rates.'
        }
      ]
    },
    {
      id: 'account',
      name: 'Account Management',
      icon: <UserGroupIcon className="w-6 h-6" />,
      questions: [
        {
          id: 'change-details',
          question: 'How do I change my personal details?',
          answer: 'You can update your personal information in the Profile section. This includes your name, email, phone number, and profile picture. For security reasons, some changes may require verification.'
        },
        {
          id: 'reset-password',
          question: 'How do I reset my password?',
          answer: 'You can change your password in the Profile section under "Change Password". If you\'ve forgotten your password, use the "Forgot Password" link on the login page to reset it via email.'
        },
        {
          id: 'close-account',
          question: 'Can I close my account?',
          answer: 'Yes, you can close your account by contacting our support team. Please note that you must withdraw any remaining balance and complete any active investments before account closure.'
        }
      ]
    }
  ];

  const toggleSection = (sectionId: string) => {
    setOpenSection(openSection === sectionId ? null : sectionId);
    setOpenQuestion(null);
  };

  const toggleQuestion = (questionId: string) => {
    setOpenQuestion(openQuestion === questionId ? null : questionId);
  };

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
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-xl max-w-3xl mx-auto text-gray-300">
              Find answers to common questions about Afro Connect
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Quick Contact */}
        <div className="bg-[#0A1929] rounded-xl shadow-xl p-6 mb-8 border-2 border-[#F97316] border-opacity-30">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-[#030614] p-3 rounded-full border border-[#F97316]">
                <EnvelopeIcon className="w-6 h-6 text-[#F97316]" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Still have questions?</p>
                <p className="font-medium text-white">support@afroconnect.com</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-[#030614] p-3 rounded-full border border-[#F97316]">
                <PhoneIcon className="w-6 h-6 text-[#F97316]" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Call us anytime</p>
                <p className="font-medium text-white">+254 700 000 000</p>
              </div>
            </div>
            <Link
              to="/contact"
              className="px-6 py-3 bg-[#F97316] text-white rounded-lg hover:bg-[#FB923C] transition shadow-lg shadow-[#F97316]/20"
            >
              Contact Support
            </Link>
          </div>
        </div>

        {/* FAQ Categories */}
        <div className="space-y-4">
          {faqCategories.map((category) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-[#0A1929] rounded-xl shadow-xl overflow-hidden border-2 border-[#F97316] border-opacity-30 hover:border-opacity-100 transition-all duration-300"
            >
              {/* Category Header */}
              <button
                onClick={() => toggleSection(category.id)}
                className="w-full px-6 py-4 flex items-center justify-between bg-[#030614] hover:bg-[#0A1929] transition duration-300"
              >
                <div className="flex items-center gap-3">
                  <div className="text-[#F97316]">{category.icon}</div>
                  <h2 className="text-lg font-semibold text-white">{category.name}</h2>
                </div>
                <ChevronDownIcon
                  className={`w-5 h-5 text-[#F97316] transition-transform duration-300 ${
                    openSection === category.id ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Category Questions */}
              <AnimatePresence>
                {openSection === category.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="divide-y divide-gray-700"
                  >
                    {category.questions.map((q) => (
                      <div key={q.id} className="px-6 py-4">
                        <button
                          onClick={() => toggleQuestion(q.id)}
                          className="w-full flex items-center justify-between text-left group"
                        >
                          <span className="font-medium text-gray-300 group-hover:text-[#F97316] transition duration-300">
                            {q.question}
                          </span>
                          <ChevronDownIcon
                            className={`w-4 h-4 text-gray-400 transition-all duration-300 ${
                              openQuestion === q.id ? 'rotate-180 text-[#F97316]' : ''
                            }`}
                          />
                        </button>
                        <AnimatePresence>
                          {openQuestion === q.id && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="mt-3 text-gray-400 text-sm leading-relaxed border-l-2 border-[#F97316] pl-4"
                            >
                              {q.answer}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* Still Need Help */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-12 bg-gradient-to-r from-[#0A1929] to-[#0F2744] rounded-xl p-8 text-center border-2 border-[#F97316] shadow-xl"
        >
          <h3 className="text-2xl font-bold text-white mb-4">Still Need Help?</h3>
          <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
            Can't find the answer you're looking for? Our support team is here to help you with any questions or concerns.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/contact"
              className="px-6 py-3 bg-[#F97316] text-white rounded-lg hover:bg-[#FB923C] transition shadow-lg shadow-[#F97316]/20"
            >
              Contact Us
            </Link>
            <Link
              to="/support"
              className="px-6 py-3 border-2 border-[#F97316] text-[#F97316] rounded-lg hover:bg-[#F97316] hover:text-white transition"
            >
              Live Chat
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default FAQ;