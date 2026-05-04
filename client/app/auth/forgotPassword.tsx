'use client';

interface ForgotPasswordFormProps {
  onGoToLogin: () => void;
  hideLoginLink?: boolean; 
}

export default function ForgotPasswordForm({ onGoToLogin, hideLoginLink = false }: ForgotPasswordFormProps) {
  return (
    <div className='flex flex-col h-auto animate-in fade-in duration-300 w-full'>

      <div className='mb-6 text-center'>
        <h1 className='text-2xl font-bold text-[#0B1221] mb-1'>Reset Password</h1>
        <p className='text-gray-400 text-sm'>Enter your email and we'll send a verification code.</p>
      </div>

      <form className='flex flex-col gap-4' onSubmit={(e) => e.preventDefault()}>
        {/* email input */}
        <div className='flex flex-col'>
          <label htmlFor='reset-email' className='text-xs font-semibold text-[#0B1221] mb-1.5'>Email Address</label>
          <div className='relative'>
            <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
              <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <input type='email' id='reset-email' placeholder='example@gmail.com' 
              className='w-full pl-10 pr-4 py-2.5 bg-white text-gray-800 border border-gray-200 rounded-lg focus:outline-none focus:border-[#8a0606] focus:ring-1 focus:ring-[#8a0606] text-sm transition-all placeholder:text-gray-400' 
            />
          </div>
        </div>

        <button type='submit' className='w-full bg-[#8a0606] hover:bg-[#660000] text-white font-semibold py-2.5 rounded-lg mt-2 transition-colors text-sm'>
          Send Verification Code
        </button>
      </form>

      {/* Conditionally render the login link based on the hideLoginLink prop */}
      {!hideLoginLink && (
        <p className='text-center text-xs text-[#0B1221] font-semibold mt-8'>
          Remembered your password?{' '}
          <button type='button' onClick={onGoToLogin} className='text-[#8a0606] hover:underline'>Log in</button>
        </p>
      )}
    </div>
  );
}