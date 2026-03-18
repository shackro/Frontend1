// frontend/src/components/common/CurrencySelector.tsx

import React, { Fragment } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';
import { useCurrency } from '../../contexts/CurrencyContext';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { type CurrencyCode, SUPPORTED_CURRENCIES } from '../../types/currency';

const CurrencySelector: React.FC = () => {
  const { currency, setCurrency, availableCurrencies } = useCurrency();
  const { user, updateUser } = useAuth();

  const handleCurrencyChange = async (code: CurrencyCode) => {
    // Update local state first
    setCurrency(code);

    // If user is logged in, save preference to backend
    if (user) {
      try {
        await api.updateUserCurrency(code);
        // Update local user object
        const updatedUser = { ...user, preferred_currency: code };
        updateUser(updatedUser);
        toast.success(`Currency changed to ${code}`, {
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
      } catch (error) {
        console.error('Failed to update currency preference:', error);
        toast.error('Failed to update currency preference', {
          style: {
            background: '#0A1929',
            color: '#F97316',
            border: '1px solid #DC2626',
          },
        });
      }
    } else {
      // Just save to localStorage for non-authenticated users
      localStorage.setItem('preferred_currency', code);
    }
  };

  return (
    <div className="w-32">
      <Listbox value={currency.code} onChange={handleCurrencyChange}>
        <div className="relative mt-1">
          <Listbox.Button className="relative w-full cursor-default rounded-lg bg-[#0A1929] py-2 pl-3 pr-10 text-left border-2 border-[#F97316] focus:outline-none focus-visible:border-[#F97316] focus-visible:ring-2 focus-visible:ring-[#F97316] sm:text-sm hover:bg-[#0F2744] transition duration-300">
            <span className="flex items-center gap-2 text-white">
              <span>{currency.flag}</span>
              <span>{currency.code}</span>
            </span>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronUpDownIcon
                className="h-5 w-5 text-[#F97316]"
                aria-hidden="true"
              />
            </span>
          </Listbox.Button>
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-[#0A1929] py-1 text-base shadow-lg ring-1 ring-[#F97316] ring-opacity-50 focus:outline-none sm:text-sm z-50 border border-[#F97316]">
              {availableCurrencies.map((curr) => (
                <Listbox.Option
                  key={curr.code}
                  className={({ active }) =>
                    `relative cursor-default select-none py-2 pl-10 pr-4 transition duration-200 ${
                      active ? 'bg-[#F97316] text-white' : 'text-gray-200'
                    }`
                  }
                  value={curr.code}
                >
                  {({ selected }) => (
                    <>
                      <span className={`flex items-center gap-2 ${selected ? 'font-medium text-[#F97316]' : 'font-normal'}`}>
                        <span>{curr.flag}</span>
                        <span>{curr.code} - {curr.symbol}</span>
                      </span>
                      {selected ? (
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#F97316]">
                          <CheckIcon className="h-5 w-5" aria-hidden="true" />
                        </span>
                      ) : null}
                    </>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
    </div>
  );
};

export default CurrencySelector;