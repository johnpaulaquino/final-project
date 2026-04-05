'use client';

import { useRouter } from 'next/navigation';

interface LoginFormProps {
  onGoToSignup: () => void;
  onGoToForgotPassword: () => void;
}

export default function Login({ onGoToSignup, onGoToForgotPassword }: LoginFormProps) {
  const router = useRouter();
  
  const handleLogin = async () => {
    router.push('/customer');
  };

  return (
    <div className='flex flex-col h-auto animate-in fade-in duration-300 w-full'>

      <div className='mb-6 text-center'>
        <h1 className='text-2xl font-bold text-[#0B1221] mb-1'>Welcome back</h1>
        <p className='text-gray-400 text-sm'>Please enter your details to sign in.</p>
      </div>

      <form className='flex flex-col gap-4' onSubmit={(e) => e.preventDefault()}>
        {/* email input */}
        <div className='flex flex-col'>
          <label htmlFor='email' className='text-xs font-semibold text-[#0B1221] mb-1.5'>Email Address</label>
          <div className='relative'>
            <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
              <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <input 
              type='email' 
              id='email' 
              placeholder='example@gmail.com' 
              className='w-full pl-10 pr-4 py-2.5 bg-white text-gray-800 border border-gray-200 rounded-lg focus:outline-none focus:border-[#8a0606] focus:ring-1 focus:ring-[#8a0606] text-sm transition-all placeholder:text-gray-400' 
            />
          </div>
        </div>

        {/* password input */}
        <div className='flex flex-col'>
          <label htmlFor='password' className='text-xs font-semibold text-[#0B1221] mb-1.5'>Password</label>
          <div className='relative'>
            <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
              <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <input 
              type='password' 
              id='password' 
              placeholder='Password' 
              className='w-full pl-10 pr-4 py-2.5 bg-white text-gray-800 border border-gray-200 rounded-lg focus:outline-none focus:border-[#8a0606] focus:ring-1 focus:ring-[#8a0606] text-sm transition-all placeholder:text-gray-400' 
            />
          </div>
        </div>

        <div className='flex justify-end'>
          <button type='button' onClick={onGoToForgotPassword} className='text-xs text-[#8a0606] hover:underline font-semibold'>
            Forgot password?
          </button>
        </div>

        <button type='submit' onClick={handleLogin} className='w-full bg-[#8a0606] hover:bg-[#660000] text-white font-semibold py-2.5 rounded-lg mt-2 transition-colors text-sm'>
          Sign In
        </button>
      </form>

      <div className='flex items-center my-6'>
        <div className='flex-grow border-t border-gray-200'></div>
        <span className='mx-4 text-xs text-gray-400 font-medium'>Or continue with</span>
        <div className='flex-grow border-t border-gray-200'></div>
      </div>

      <button className='w-full flex items-center justify-center gap-2 border border-gray-200 rounded-lg py-2.5 text-sm font-semibold text-[#0B1221] hover:bg-gray-50 transition-colors mb-6'>
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        Google
      </button>

      <p className='text-center text-xs text-[#0B1221] font-semibold'>
        Don't have an account?{' '}
        <button type='button' onClick={onGoToSignup} className='text-[#8a0606] hover:underline'>Sign up</button>
      </p>
    </div>
  );
}