'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import AuthModal from '../auth/authModal';

export default function headNavbar() {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  // Add state to track which view should open
  const [modalView, setModalView] = useState<'login' | 'signup'>('login');

  // Helper function to open the modal with a specific view
  const openModal = (view: 'login' | 'signup') => {
    setModalView(view);
    setIsPopupOpen(true);
  };

  return (
    <nav className='fixed top-0 left-0 z-50 w-full shadow-sm bg-white flex items-center justify-between px-6 py-4 mx-auto '>    
      {/*Logo*/}
      <div className='flex items-center gap-3'>
        <div className='relative h-10 w-10'></div>
        <span className='text-[#800000] font-bold text-xl tracking-tight'>
          Biskota
        </span>
      </div>

      <div className='flex items-center gap-4'>
        {/* Pass 'login' to openModal */}
        <button 
          onClick={() => openModal('login')} 
          className='hidden md:block px-6 py-2 rounded-full border border-gray-200 bg-white text-sm font-bold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition shadow-sm'
        >
          Login
        </button>

        {/* Pass 'signup' to openModal */}
        <button 
          onClick={() => openModal('signup')} 
          className='px-6 py-2 rounded-full bg-[#800000] text-sm font-bold text-white shadow-lg shadow-red-900/20 hover:bg-[#631515] transition transform hover:-translate-y-0.5'
        >
          Sign Up
        </button>

        <AuthModal 
          isOpen={isPopupOpen} 
          onClose={() => setIsPopupOpen(false)} 
          initialView={modalView} // Pass the view down to the modal
        />

      </div>
    </nav>
  )
}