import React from 'react';
import { Link } from 'react-router-dom';
import {
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaLinkedin,
  FaTelegram,
} from 'react-icons/fa';
import AfroConnectLogo from '../../assets/afrologo.jpeg'; // Adjust the path to your actual logo


const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#030614] text-white border-t-2 border-[#F97316]">
      <div className="w-screen mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#F97316] group-hover:border-[#FB923C] transition-all duration-300 shadow-lg shadow-[#F97316]/20">
                <img
                  src={AfroConnectLogo}
                  alt="Afro Connect Logo"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="font-bold text-xl text-white">Afro Connect</span>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Smart Investments. Structured Growth. Real Opportunities.
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="text-gray-400 hover:text-[#F97316] transition duration-300 transform hover:scale-110"
                aria-label="Facebook"
              >
                <FaFacebook size={20} />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-[#F97316] transition duration-300 transform hover:scale-110"
                aria-label="Twitter"
              >
                <FaTwitter size={20} />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-[#F97316] transition duration-300 transform hover:scale-110"
                aria-label="Instagram"
              >
                <FaInstagram size={20} />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-[#F97316] transition duration-300 transform hover:scale-110"
                aria-label="LinkedIn"
              >
                <FaLinkedin size={20} />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-[#F97316] transition duration-300 transform hover:scale-110"
                aria-label="Telegram"
              >
                <FaTelegram size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white border-b-2 border-[#F97316] border-opacity-30 pb-2 inline-block">
              Quick Links
            </h3>
            <ul className="space-y-2 mt-4">
              <li>
                <Link
                  to="/"
                  className="text-gray-400 hover:text-[#F97316] transition duration-300 flex items-center gap-2 group"
                >
                  <span className="w-1 h-1 bg-[#F97316] rounded-full opacity-0 group-hover:opacity-100 transition"></span>
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/products"
                  className="text-gray-400 hover:text-[#F97316] transition duration-300 flex items-center gap-2 group"
                >
                  <span className="w-1 h-1 bg-[#F97316] rounded-full opacity-0 group-hover:opacity-100 transition"></span>
                  Products
                </Link>
              </li>
              <li>
                <Link
                  to="/dashboard"
                  className="text-gray-400 hover:text-[#F97316] transition duration-300 flex items-center gap-2 group"
                >
                  <span className="w-1 h-1 bg-[#F97316] rounded-full opacity-0 group-hover:opacity-100 transition"></span>
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  to="/team"
                  className="text-gray-400 hover:text-[#F97316] transition duration-300 flex items-center gap-2 group"
                >
                  <span className="w-1 h-1 bg-[#F97316] rounded-full opacity-0 group-hover:opacity-100 transition"></span>
                  Team
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white border-b-2 border-[#F97316] border-opacity-30 pb-2 inline-block">
              Support
            </h3>
            <ul className="space-y-2 mt-4">
              <li>
                <Link
                  to="/faq"
                  className="text-gray-400 hover:text-[#F97316] transition duration-300 flex items-center gap-2 group"
                >
                  <span className="w-1 h-1 bg-[#F97316] rounded-full opacity-0 group-hover:opacity-100 transition"></span>
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-gray-400 hover:text-[#F97316] transition duration-300 flex items-center gap-2 group"
                >
                  <span className="w-1 h-1 bg-[#F97316] rounded-full opacity-0 group-hover:opacity-100 transition"></span>
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="text-gray-400 hover:text-[#F97316] transition duration-300 flex items-center gap-2 group"
                >
                  <span className="w-1 h-1 bg-[#F97316] rounded-full opacity-0 group-hover:opacity-100 transition"></span>
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy"
                  className="text-gray-400 hover:text-[#F97316] transition duration-300 flex items-center gap-2 group"
                >
                  <span className="w-1 h-1 bg-[#F97316] rounded-full opacity-0 group-hover:opacity-100 transition"></span>
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white border-b-2 border-[#F97316] border-opacity-30 pb-2 inline-block">
              Stay Updated
            </h3>
            <p className="text-gray-400 text-sm mb-4 mt-4">
              Subscribe to our newsletter for the latest updates and investment opportunities.
            </p>
            <form className="flex flex-col space-y-3">
              <input
                type="email"
                placeholder="Your email"
                className="px-4 py-3 bg-[#0A1929] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F97316] border border-gray-700 focus:border-[#F97316] transition"
              />
              <button className="px-4 py-3 bg-[#F97316] text-white rounded-lg hover:bg-[#FB923C] transition duration-300 font-medium shadow-lg shadow-[#F97316]/20 transform hover:scale-[1.02]">
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            © {currentYear} Afro Connect. All rights reserved.
          </p>
          <p className="text-gray-500 text-xs mt-2 flex items-center justify-center gap-2">
            <span className="w-1 h-1 bg-[#F97316] rounded-full"></span>
            Participation involves risk. Only invest what you can afford to lose.
            <span className="w-1 h-1 bg-[#F97316] rounded-full"></span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;