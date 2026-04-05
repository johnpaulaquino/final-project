'use client';

import { useState } from 'react';

interface SignupFormProps {
  onGoToLogin: () => void;
}

export default function Signup({ onGoToLogin }: SignupFormProps) {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          // Enter Email
          <>
            <div className='mb-6 text-center'>
              <h1 className='text-2xl font-bold text-[#0B1221] mb-1'>Create an account</h1>
              <p className='text-gray-400 text-sm'>Let's get started by verifying your email.</p>
            </div>
            <form className='flex flex-col gap-4' onSubmit={(e) => { e.preventDefault(); setStep(2); }}>
              <div className='flex flex-col'>
                <label htmlFor='signup-email' className='text-xs font-semibold text-[#0B1221] mb-1.5'>Email Address</label>
                <div className='relative'>
                  <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                    <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <input type='email' id='signup-email' placeholder='hello@biskota.com' value={email} onChange={(e) => setEmail(e.target.value)} required
                    className='w-full pl-10 pr-4 py-2.5 bg-white text-gray-800 border border-gray-200 rounded-lg focus:outline-none focus:border-[#8a0606] focus:ring-1 focus:ring-[#8a0606] text-sm transition-all placeholder:text-gray-400' 
                  />
                </div>
              </div>
              <button type='submit' className='w-full bg-[#8a0606] hover:bg-[#660000] text-white font-semibold py-2.5 rounded-lg mt-2 transition-colors text-sm flex items-center justify-center gap-2'>
                Continue
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
              </button>
            </form>
            <p className='text-center text-xs text-[#0B1221] font-semibold mt-8'>
              Already have an account?{' '}
              <button type='button' onClick={onGoToLogin} className='text-[#8a0606] hover:underline'>Log in</button>
            </p>
          </>
        );
      {/* Verify Email */}
      case 2:
        return (
          <div className="relative">
            <button onClick={() => setStep(1)} className="absolute -left-4 top-1 text-gray-400 hover:text-gray-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
            </button>
            <div className='mb-6 text-center'>
              <h1 className='text-2xl font-bold text-[#0B1221] mb-1'>Verify Email</h1>
              <p className='text-gray-400 text-sm'>We sent a 6-digit code to <span className="font-semibold text-gray-700">{email || 'your email'}</span>.</p>
            </div>
            <form className='flex flex-col gap-6' onSubmit={(e) => { e.preventDefault(); setStep(3); }}>
              <div className="flex justify-between gap-2">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <input key={i} type="text" maxLength={1} className="w-12 h-12 text-center text-lg font-semibold border border-gray-200 rounded-lg focus:border-[#8a0606] focus:ring-1 focus:ring-[#8a0606] focus:outline-none" />
                ))}
              </div>
              <p className="text-center text-xs text-gray-500 font-semibold">
                Didn't receive the code? <button type="button" className="text-[#8a0606] hover:underline">Resend</button>
              </p>
              <button type='submit' className='w-full bg-[#8a0606] hover:bg-[#660000] text-white font-semibold py-2.5 rounded-lg transition-colors text-sm'>
                Verify Code
              </button>
            </form>
          </div>
        );
      {/* Set Password */}
      case 3:
        return (
          <div className="relative">
            <button onClick={() => setStep(2)} className="absolute -left-4 top-1 text-gray-400 hover:text-gray-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
            </button>
            <div className='mb-6 text-center'>
              <h1 className='text-2xl font-bold text-[#0B1221] mb-1'>Your Details</h1>
              <p className='text-gray-400 text-sm'>Almost there! Setup your profile and password.</p>
            </div>
            <form className='flex flex-col gap-4' onSubmit={(e) => { e.preventDefault(); setStep(4); }}>
              <div className="flex gap-4">
                <div className='flex flex-col w-1/2'>
                  <label className='text-xs font-semibold text-[#0B1221] mb-1.5'>First Name</label>
                  <div className='relative'>
                    <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                      <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    </div>
                    <input 
                      type='text' 
                      placeholder='First Name' 
                      className='w-full pl-9 pr-3 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-[#8a0606] focus:ring-1 focus:ring-[#8a0606] text-sm placeholder:text-gray-400' />
                  </div>
                </div>
                <div className='flex flex-col w-1/2'>
                  <label className='text-xs font-semibold text-[#0B1221] mb-1.5'>Last Name</label>
                  <div className='relative'>
                    <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                      <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    </div>
                    <input 
                      type='text' 
                      placeholder='Last Name' 
                      className='w-full pl-9 pr-3 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-[#8a0606] focus:ring-1 focus:ring-[#8a0606] text-sm placeholder:text-gray-400' />
                  </div>
                </div>
              </div>

              {/* password input */}
              <div className='flex flex-col'>
                <label className='text-xs font-semibold text-[#0B1221] mb-1.5'>Create Password</label>
                <div className='relative'>
                  <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                    <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                  </div>
                  <input 
                    type='password' 
                    placeholder='Password' 
                    className='w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-[#8a0606] focus:ring-1 focus:ring-[#8a0606] text-sm placeholder:text-gray-400' />
                </div>
              </div>


              {/* confirm password input */}
              <div className='flex flex-col'>
                <label className='text-xs font-semibold text-[#0B1221] mb-1.5'>Confirm Password</label>
                <div className='relative'>
                  <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                    <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                  </div>
                  <input 
                    type='password' 
                    placeholder='Confirm Password' 
                    className='w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-[#8a0606] focus:ring-1 focus:ring-[#8a0606] text-sm placeholder:text-gray-400' />
                </div>
              </div>

              <button type='submit' className='w-full bg-[#8a0606] hover:bg-[#660000] text-white font-semibold py-2.5 rounded-lg mt-2 transition-colors text-sm'>
                Create Account
              </button>
            </form>
          </div>
        );

      case 4:
        return (
          <div className="flex flex-col items-center text-center animate-in zoom-in duration-300">
            <div className="w-16 h-16 bg-[#faecec] rounded-full flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-[#8a0606]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h1 className='text-2xl font-bold text-[#0B1221] mb-2'>All Done!</h1>
            <p className='text-gray-400 text-sm mb-8 px-4'>Your Biskota account has been created successfully.</p>
            <button onClick={onGoToLogin} className='w-full bg-[#8a0606] hover:bg-[#660000] text-white font-semibold py-2.5 rounded-lg transition-colors text-sm'>
              Proceed to Login
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className='flex flex-col h-auto w-full'>
      {renderStep()}
    </div>
  );
}