'use client';

import { useState } from 'react';
import Image from 'next/image';
import AuthModal from '../auth/authModal';

interface HeadNavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function HeadNavbar({ activeTab, setActiveTab }: HeadNavbarProps) {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [modalView, setModalView] = useState<'login' | 'signup'>('login');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const openModal = (view: 'login' | 'signup') => {
    setModalView(view);
    setIsPopupOpen(true);
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className='fixed top-0 left-0 z-50 w-full shadow-sm bg-white'>
      <div className='flex items-center justify-between px-6 py-4 mx-auto max-w-7xl'>
        {/* Logo */}
        <div className='flex items-center gap-3'>
          <div className='relative h-10 w-10'>
            <Image
              src='/logo.jpg'
              alt='Biskota Logo'
              fill
              className='object-contain rounded-full'
            />
          </div>
          <span className='text-[#800000] font-bold text-xl tracking-tight'>
            Biskota
          </span>
        </div>

        <div className='hidden md:flex items-center gap-5'>
          <button 
            onClick={() => openModal('login')} 
            className='cursor-pointer px-7 py-3 rounded-full border border-gray-200 bg-white text-sm font-bold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition shadow-sm'
          >
            Login
          </button>

          <button 
            onClick={() => openModal('signup')} 
            className='cursor-pointer px-7 py-3 rounded-full bg-[#800000] text-sm font-bold text-white shadow-lg shadow-red-900/20 hover:bg-[#631515] transition transform hover:-translate-y-0.5'
          >
            Sign Up
          </button>
        </div>

        {/* Mobile View: Animated Hamburger Icon */}
        <div className='md:hidden flex items-center'>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className='flex flex-col justify-center items-center w-8 h-8 space-y-1.5 focus:outline-none group'
            aria-label='Toggle menu'
          >
            <span 
              className={`block w-6 h-0.5 bg-gray-700 transition-transform duration-300 ease-in-out group-hover:bg-[#800000] ${
                isMobileMenuOpen ? 'rotate-45 translate-y-2' : ''
              }`} 
            />
            <span 
              className={`block w-6 h-0.5 bg-gray-700 transition-opacity duration-300 ease-in-out group-hover:bg-[#800000] ${
                isMobileMenuOpen ? 'opacity-0' : 'opacity-100'
              }`} 
            />
            <span 
              className={`block w-6 h-0.5 bg-gray-700 transition-transform duration-300 ease-in-out group-hover:bg-[#800000] ${
                isMobileMenuOpen ? '-rotate-45 -translate-y-2' : ''
              }`} 
            />
          </button>
        </div>
      </div>

      {/* Mobile View: Animated Dropdown Menu */}
      <div 
        className={`md:hidden absolute top-full left-0 w-full bg-white border-b border-gray-100 shadow-xl flex flex-col gap-3 px-6 overflow-hidden transition-all duration-300 ease-in-out ${
          isMobileMenuOpen ? 'max-h-64 py-6 opacity-100 visible' : 'max-h-0 py-0 opacity-0 invisible'
        }`}
      >
        <button 
          onClick={() => openModal('login')} 
          className='w-full cursor-pointer px-7 py-3 rounded-full border border-gray-200 bg-white text-sm font-bold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition shadow-sm'
        >
          Login
        </button>

        <button 
          onClick={() => openModal('signup')} 
          className='w-full cursor-pointer px-7 py-3 rounded-full bg-[#800000] text-sm font-bold text-white shadow-lg shadow-red-900/20 hover:bg-[#631515] transition'
        >
          Sign Up
        </button>
      </div>

      <AuthModal 
        isOpen={isPopupOpen} 
        onClose={() => setIsPopupOpen(false)} 
        initialView={modalView}
      />
    </nav>
  );
}