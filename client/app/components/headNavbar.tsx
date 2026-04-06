'use client';

import { useState } from 'react';
import Image from 'next/image';
import AuthModal from '../auth/authModal';

export default function headNavbar() {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [modalView, setModalView] = useState<'login' | 'signup'>('login');

  const openModal = (view: 'login' | 'signup') => {
    setModalView(view);
    setIsPopupOpen(true);
  };

  return (
    <nav className='fixed top-0 left-0 z-50 w-full shadow-sm bg-white flex items-center justify-between px-6 py-4 mx-auto '>    
      {/*Logo*/}
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

      <div className='flex items-center gap-5'>
        {/*login button para iopen yung for para sa authModal*/}
        <button 
          onClick={() => openModal('login')} 
          className='cursor-pointer hidden md:block px-7 py-3 rounded-full border border-gray-200 bg-white text-sm font-bold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition shadow-sm'
        >
          Login
        </button>

        {/*same sa login but directly sya napupunta sa signup*/}
        <button 
          onClick={() => openModal('signup')} 
          className='cursor-pointer px-7 py-3 rounded-full bg-[#800000] text-sm font-bold text-white shadow-lg shadow-red-900/20 hover:bg-[#631515] transition transform hover:-translate-y-0.5'
        >
          Sign Up
        </button>

        <AuthModal 
          isOpen={isPopupOpen} 
          onClose={() => setIsPopupOpen(false)} 
          initialView={modalView}
        />

      </div>
    </nav>
  )
}