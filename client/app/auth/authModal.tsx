'use client';

import { useEffect, useState } from 'react';
import LoginForm from './login';
import SignupForm from './signup';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialView?: 'login' | 'signup'; // para malaman kung anong view ang ipapakita pag nag open yung modal, default is 'login'
}

export default function AuthModal({ isOpen, onClose, initialView = 'login' }: AuthModalProps) {
  const [currentView, setCurrentView] = useState<'login' | 'signup' | 'forgot-password'>(initialView);

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('overflow-hidden');
      // kung saan yung initial view pag nag open yung modal
      setCurrentView(initialView); 
    } else {
      document.body.classList.remove('overflow-hidden');
      // reset view para may animation yung pag close
      setTimeout(() => setCurrentView(initialView), 300);
    }
    return () => document.body.classList.remove('overflow-hidden');
  }, [isOpen, initialView]); // para ma-update yung view pag nag change yung initialView habang bukas yung modal

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-[9999] flex bg-black/80 backdrop-blur-sm items-center justify-center p-4'>
      
      <div className='bg-white rounded-[32px] md:rounded-[40px] shadow-2xl flex w-full max-w-5xl overflow-hidden min-h-[500px] relative'>
        
        {/* Left Side */}
        <div className='w-full md:w-1/2 px-8 py-10 sm:px-12 md:px-16 md:py-12 flex flex-col justify-center'>
          
          {/* pag switch ng view */}
          {currentView === 'login' && (
            <LoginForm 
              onGoToSignup={() => setCurrentView('signup')} 
              onGoToForgotPassword={() => setCurrentView('forgot-password')} 
            />
          )}
          
          {currentView === 'signup' && (
            <SignupForm 
              onGoToLogin={() => setCurrentView('login')} 
            />
          )}

        </div>

        {/* Right Side */}
        <div className='hidden md:block w-1/2 relative bg-[#D31D24]'>
        </div>
        
      </div>
    </div>
  );
}