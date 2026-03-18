import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ShieldCheckIcon,
  LockClosedIcon,
  EyeIcon,
  DocumentTextIcon,
  GlobeAltIcon,
  EnvelopeIcon,
  ServerIcon,
  UserGroupIcon,
  KeyIcon,
  CloudIcon,
} from '@heroicons/react/24/outline';

const Privacy: React.FC = () => {
  const sections = [
    {
      icon: <ShieldCheckIcon className="w-6 h-6" />,
      title: '1. Information We Collect',
      content: 'We collect information you provide directly to us, such as when you create an account, complete KYC verification, make transactions, or contact support. This includes your name, email address, phone number, identification documents, and financial information.',
    },
    {
      icon: <ServerIcon className="w-6 h-6" />,
      title: '2. How We Use Your Information',
      content: 'We use your information to provide and improve our services, process transactions, verify your identity, communicate with you, and comply with legal obligations. Your data helps us maintain platform security and prevent fraudulent activities.',
    },
    {
      icon: <LockClosedIcon className="w-6 h-6" />,
      title: '3. Data Security',
      content: 'We implement industry-standard security measures including encryption, secure servers, and access controls to protect your personal information. Regular security audits are conducted to ensure your data remains safe.',
    },
    {
      icon: <UserGroupIcon className="w-6 h-6" />,
      title: '4. Sharing of Information',
      content: 'We do not sell your personal information to third parties. We may share your information with service providers who assist in platform operations, with law enforcement when required by law, or with your explicit consent.',
    },
    {
      icon: <GlobeAltIcon className="w-6 h-6" />,
      title: '5. International Data Transfers',
      content: 'Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your data in accordance with this privacy policy.',
    },
    {
      icon: <DocumentTextIcon className="w-6 h-6" />,
      title: '6. Data Retention',
      content: 'We retain your personal information for as long as your account is active or as needed to provide services. We may also retain certain information to comply with legal obligations, resolve disputes, and enforce agreements.',
    },
    {
      icon: <EyeIcon className="w-6 h-6" />,
      title: '7. Your Rights',
      content: 'You have the right to access, correct, or delete your personal information. You may also object to or restrict certain processing of your data. Contact our support team to exercise these rights.',
    },
    {
      icon: <KeyIcon className="w-6 h-6" />,
      title: '8. Cookies and Tracking',
      content: 'We use cookies and similar technologies to enhance your experience, analyze platform usage, and personalize content. You can control cookie settings through your browser preferences.',
    },
    {
      icon: <CloudIcon className="w-6 h-6" />,
      title: '9. Third-Party Services',
      content: 'Our platform may contain links to third-party websites or services. We are not responsible for the privacy practices of these third parties. We encourage you to review their privacy policies.',
    },
    {
      icon: <EnvelopeIcon className="w-6 h-6" />,
      title: '10. Communications',
      content: 'We may send you service-related emails, notifications, and marketing communications. You can opt out of marketing communications at any time through your account settings or by contacting us.',
    },
    {
      icon: <DocumentTextIcon className="w-6 h-6" />,
      title: '11. Changes to Privacy Policy',
      content: 'We may update this privacy policy from time to time. We will notify you of significant changes through email or platform notifications. Your continued use of our services constitutes acceptance of the updated policy.',
    },
    {
      icon: <ShieldCheckIcon className="w-6 h-6" />,
      title: '12. Contact Us',
      content: 'If you have questions about this privacy policy or our data practices, please contact our Data Protection Officer at privacy@afroconnect.com or through our contact form.',
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
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Privacy Policy</h1>
            <p className="text-xl max-w-3xl mx-auto text-gray-300">
              How we protect and handle your personal information
            </p>
            <p className="text-sm text-gray-400 mt-4">Last Updated: March 1, 2024</p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Privacy Commitment */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-[#0A1929] rounded-xl shadow-xl p-6 mb-8 border-l-4 border-[#F97316] border-2 border-[#F97316] border-opacity-30"
        >
          <h2 className="text-lg font-semibold text-white mb-3">Our Commitment to Privacy</h2>
          <p className="text-gray-400">
            At Afro Connect, your privacy is our priority. We are committed to protecting your personal information and being transparent about how we collect, use, and safeguard your data. This policy explains our practices and your rights regarding your information.
          </p>
        </motion.div>

        {/* Privacy Sections */}
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

        {/* Data Protection Statement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-8 bg-[#0A1929] rounded-xl p-6 border-2 border-[#F97316] border-opacity-30"
        >
          <div className="flex items-start gap-3">
            <ShieldCheckIcon className="w-5 h-5 text-[#F97316] flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-white mb-2">Data Protection Officer</h4>
              <p className="text-sm text-gray-400 mb-3">
                For any privacy-related concerns or to exercise your data rights, please contact our Data Protection Officer:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium text-[#F97316]">Email:</p>
                  <p className="text-gray-400">privacy@afroconnect.com</p>
                </div>
                <div>
                  <p className="font-medium text-[#F97316]">Address:</p>
                  <p className="text-gray-400">123 Investment Avenue, Nairobi, Kenya</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Cookie Consent Notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="mt-6 bg-[#030614] rounded-xl p-4 text-sm text-gray-400 border border-[#F97316] border-opacity-30"
        >
          <p className="flex items-center gap-2">
            <span className="w-1 h-1 bg-[#F97316] rounded-full"></span>
            <strong className="text-white">Cookie Notice:</strong> Afro Connect uses cookies to enhance your browsing experience, analyze site traffic, and personalize content. By continuing to use our site, you consent to our use of cookies in accordance with our privacy policy.
          </p>
        </motion.div>

        {/* Contact for Questions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="mt-8 text-center"
        >
          <p className="text-gray-400">
            Have questions about our privacy practices?{' '}
            <Link to="/contact" className="text-[#F97316] hover:text-[#FB923C] font-medium transition">
              Contact our privacy team
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Privacy;