import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
  CheckCircleIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import Button from '../components/common/Button';
import toast from 'react-hot-toast';

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  message: z.string().min(20, 'Message must be at least 20 characters'),
  priority: z.enum(['low', 'normal', 'high']).default('normal'),
});

type ContactFormData = z.infer<typeof contactSchema>;

const Contact: React.FC = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      priority: 'normal',
    },
  });

  const onSubmit = async (data: ContactFormData) => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    console.log('Contact form submitted:', data);
    toast.success('Message sent successfully! We\'ll respond within 24 hours.', {
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
    setIsSubmitted(true);
    reset();
    setLoading(false);
  };

  const contactMethods = [
    {
      icon: <EnvelopeIcon className="w-6 h-6" />,
      title: 'Email Us',
      details: ['support@afroconnect.com', 'business@afroconnect.com'],
      action: 'Send a message',
      link: 'mailto:support@afroconnect.com',
    },
    {
      icon: <PhoneIcon className="w-6 h-6" />,
      title: 'Call Us',
      details: ['+254 700 000 000', '+254 711 111 111'],
      action: 'Request a call',
      link: 'tel:+254700000000',
    },
    {
      icon: <MapPinIcon className="w-6 h-6" />,
      title: 'Visit Us',
      details: ['123 Investment Avenue', 'Nairobi, Kenya 00100'],
      action: 'Get directions',
      link: 'https://maps.google.com',
    },
    {
      icon: <ClockIcon className="w-6 h-6" />,
      title: 'Business Hours',
      details: ['Monday - Friday: 8:00 - 18:00', 'Saturday: 9:00 - 13:00', 'Sunday: Closed'],
      action: '24/7 support available',
      link: '#',
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
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Contact Us</h1>
            <p className="text-xl max-w-3xl mx-auto text-gray-300">
              Get in touch with our support team. We're here to help 24/7.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Contact Methods Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {contactMethods.map((method, index) => (
            <motion.a
              key={index}
              href={method.link}
              target={method.link.startsWith('http') && !method.link.includes('tel') && !method.link.includes('mailto') ? '_blank' : undefined}
              rel={method.link.startsWith('http') && !method.link.includes('tel') && !method.link.includes('mailto') ? 'noopener noreferrer' : undefined}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-[#0A1929] rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 group border-2 border-[#F97316] border-opacity-30 hover:border-opacity-100 hover:-translate-y-1"
            >
              <div className="w-12 h-12 bg-[#030614] rounded-lg flex items-center justify-center text-[#F97316] mb-4 group-hover:bg-[#F97316] group-hover:text-white transition border border-[#F97316]">
                {method.icon}
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{method.title}</h3>
              {method.details.map((detail, i) => (
                <p key={i} className="text-sm text-gray-400">{detail}</p>
              ))}
              <p className="text-sm text-[#F97316] mt-3 group-hover:underline flex items-center gap-1">
                {method.action} <ChevronRightIcon className="w-4 h-4" />
              </p>
            </motion.a>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-[#0A1929] rounded-2xl shadow-xl p-8 border-2 border-[#F97316] border-opacity-30"
          >
            <h2 className="text-2xl font-bold text-white mb-6">Send us a Message</h2>

            {isSubmitted ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-[#030614] rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-[#F97316]">
                  <CheckCircleIcon className="w-8 h-8 text-[#F97316]" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Message Sent!</h3>
                <p className="text-gray-400 mb-6">
                  Thank you for contacting us. We'll get back to you within 24 hours.
                </p>
                <Button
                  onClick={() => setIsSubmitted(false)}
                  variant="primary"
                >
                  Send Another Message
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Your Name
                  </label>
                  <input
                    type="text"
                    {...register('name')}
                    className="w-full px-4 py-3 bg-[#030614] border-2 border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-[#F97316] focus:border-transparent transition duration-300"
                    placeholder="John Doe"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-400">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    {...register('email')}
                    className="w-full px-4 py-3 bg-[#030614] border-2 border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-[#F97316] focus:border-transparent transition duration-300"
                    placeholder="you@example.com"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-400">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    {...register('subject')}
                    className="w-full px-4 py-3 bg-[#030614] border-2 border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-[#F97316] focus:border-transparent transition duration-300"
                    placeholder="How can we help?"
                  />
                  {errors.subject && (
                    <p className="mt-1 text-sm text-red-400">{errors.subject.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Priority
                  </label>
                  <select
                    {...register('priority')}
                    className="w-full px-4 py-3 bg-[#030614] border-2 border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-[#F97316] focus:border-transparent transition duration-300"
                  >
                    <option value="low" className="bg-[#0A1929]">Low - General Inquiry</option>
                    <option value="normal" className="bg-[#0A1929]">Normal - Support Request</option>
                    <option value="high" className="bg-[#0A1929]">High - Urgent Issue</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Message
                  </label>
                  <textarea
                    {...register('message')}
                    rows={5}
                    className="w-full px-4 py-3 bg-[#030614] border-2 border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-[#F97316] focus:border-transparent transition duration-300"
                    placeholder="Please describe your issue or question in detail..."
                  />
                  {errors.message && (
                    <p className="mt-1 text-sm text-red-400">{errors.message.message}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  loading={loading}
                >
                  <PaperAirplaneIcon className="w-5 h-5 mr-2" />
                  Send Message
                </Button>
              </form>
            )}
          </motion.div>

          {/* FAQ Preview & Live Chat */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="space-y-6"
          >
            {/* FAQ Preview */}
            <div className="bg-[#0A1929] rounded-2xl shadow-xl p-8 border-2 border-[#F97316] border-opacity-30">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-[#030614] rounded-lg flex items-center justify-center border border-[#F97316]">
                  <ChatBubbleLeftRightIcon className="w-5 h-5 text-[#F97316]" />
                </div>
                <h3 className="text-xl font-semibold text-white">Frequently Asked Questions</h3>
              </div>

              <div className="space-y-4">
                {[
                  {
                    q: 'How do I make a deposit?',
                    a: 'Go to Transactions page and click "Deposit". Choose your payment method and enter the amount.',
                  },
                  {
                    q: 'How long do withdrawals take?',
                    a: 'Withdrawals are typically processed within 24-48 hours after admin approval.',
                  },
                  {
                    q: 'What currencies do you support?',
                    a: 'We support USD, KES (Kenyan Shilling), and EUR. You can switch between currencies anytime.',
                  },
                  {
                    q: 'Is my money safe?',
                    a: 'We use industry-standard security measures to protect your funds and personal information.',
                  },
                ].map((faq, index) => (
                  <div key={index} className="border-b border-gray-700 last:border-0 pb-4 last:pb-0">
                    <h4 className="font-medium text-white mb-2">{faq.q}</h4>
                    <p className="text-sm text-gray-400">{faq.a}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6">
                <Link
                  to="/faq"
                  className="text-[#F97316] hover:text-[#FB923C] font-medium inline-flex items-center transition group"
                >
                  View all FAQs
                  <ChevronRightIcon className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Live Chat Card */}
            <div className="bg-gradient-to-r from-[#F97316] to-[#FB923C] rounded-2xl shadow-xl p-8 text-white border-2 border-[#F97316] border-opacity-50">
              <h3 className="text-xl font-semibold mb-3">Live Chat Support</h3>
              <p className="text-white/90 mb-6">
                Get instant help from our support team. Average response time: 2 minutes.
              </p>
              <button
                onClick={() => toast.success('Live chat coming soon!', {
                  style: {
                    background: '#0A1929',
                    color: '#F97316',
                    border: '1px solid #F97316',
                  },
                })}
                className="w-full px-6 py-3 bg-[#0A1929] text-[#F97316] rounded-lg font-semibold hover:bg-[#030614] transition border-2 border-[#F97316]"
              >
                Start Live Chat
              </button>
              <p className="text-xs text-white/75 mt-4 text-center">
                Available 24/7 for urgent inquiries
              </p>
            </div>

            {/* Office Hours */}
            <div className="bg-[#0A1929] rounded-2xl shadow-xl p-8 border-2 border-[#F97316] border-opacity-30">
              <h3 className="text-lg font-semibold text-white mb-4">Office Hours</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Monday - Friday</span>
                  <span className="font-medium text-white">8:00 AM - 6:00 PM</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Saturday</span>
                  <span className="font-medium text-white">9:00 AM - 1:00 PM</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Sunday</span>
                  <span className="font-medium text-[#F97316]">Closed</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-4 flex items-center gap-2">
                <span className="w-1 h-1 bg-[#F97316] rounded-full"></span>
                Live chat support available 24/7 for urgent issues
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Contact;