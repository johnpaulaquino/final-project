'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface LoginFormProps {
  onGoToSignup: () => void;
  onGoToForgotPassword?: () => void;
}

export default function login({ onGoToSignup, onGoToForgotPassword }: LoginFormProps) {
  // temporary handler lang to demonstrate navigation after login, dapat dito maglagay ng actual authentication logic
  const router = useRouter();
  
  const handleLogin = async () => {

    router.push('/client');

  };
  return (
    <div className='flex flex-col h-auto animate-in fade-in duration-300'>
      <div className='mb-4 text-left'>
        <h1 className='text-4xl font-bold text-black mb-2'>
          Login
        </h1>
        <p className='text-gray-500 text-sm'>
          Please enter your details to sign in
        </p>
      </div>

      <form className='flex flex-col gap-1' onSubmit={(e) => e.preventDefault()}>
        <div className='relative pt-6'>
          <input type='email' id='email' placeholder=' ' className='peer w-full pl-10 pr-4 py-2 bg-transparent text-gray-800 border-b border-gray-300 focus:outline-none focus:border-[#7B0B0E] focus:border-b-2 transition-all' />
          <label htmlFor='email' className='absolute left-10 top-1 text-xs text-[#800000] transition-all duration-200 pointer-events-none peer-placeholder-shown:top-8 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400 peer-focus:top-1 peer-focus:text-xs peer-focus:text-[#800000]'>Email</label>
        </div>

        <div className='relative pt-6'>
          <input type='password' id='password' placeholder=' ' className='peer w-full pl-10 pr-4 py-2 bg-transparent text-gray-800 border-b border-gray-300 focus:outline-none focus:border-[#7B0B0E] focus:border-b-2 transition-all' />
          <label htmlFor='password' className='absolute left-10 top-1 text-xs text-[#800000] transition-all duration-200 pointer-events-none peer-placeholder-shown:top-8 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400 peer-focus:top-1 peer-focus:text-xs peer-focus:text-[#800000]'>Password</label>
        </div>

        <div className='flex justify-end mt-4 mb-4'>
          <button type='button' 
            onClick={onGoToForgotPassword} 
            className='text-sm text-[#7B0B0E] hover:underline font-medium'>
            Forgot Password?
          </button>
        </div>

        <button type='submit' onClick={handleLogin} className='w-full bg-[#800000] hover:bg-[#5C080B] text-white font-semibold py-3.5 rounded-full mt-2 transition-colors'>
          Login
        </button>
      </form>

      <div className='flex items-center my-8'>
        <div className='flex-grow border-t border-gray-300'></div>
        <span className='mx-4 text-xs text-gray-400 font-semibold tracking-wide'>OR CONTINUE WITH</span>
        <div className='flex-grow border-t border-gray-300'></div>
      </div>

      <div className='flex justify-center gap-4 mb-8'>
        <button className='w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors'></button>
        <button className='w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors'></button>
      </div>

      <p className='text-center text-sm text-black font-semibold mt-auto'>
        Don't have an account?{' '}
        <button type='button' onClick={onGoToSignup} className='text-[#7B0B0E] hover:underline'>Sign Up</button>
      </p>
    </div>
  );
}