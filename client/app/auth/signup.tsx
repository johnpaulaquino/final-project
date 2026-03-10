'use client';

interface SignupFormProps {
  onGoToLogin: () => void;
}

export default function SignupForm({ onGoToLogin }: SignupFormProps) {
  return (
    <div className='flex flex-col h-auto animate-in fade-in duration-300'>
      <div className='mb-4 text-left'>
        <h1 className='text-4xl font-bold text-black mb-2'>
          Sign Up
        </h1>
        <p className='text-gray-500 text-sm'>
          Create an account to get started
        </p>
      </div>

      <form className='flex flex-col gap-3' onSubmit={(e) => e.preventDefault()}>
        <div className='relative pt-6'>
          <input type='text' id='name' placeholder=' ' className='peer w-full pl-10 pr-4 py-2 bg-transparent text-gray-800 border-b border-gray-300 focus:outline-none focus:border-[#7B0B0E] focus:border-b-2 transition-all' />
          <label htmlFor='name' className='absolute left-10 top-1 text-xs text-[#800000] transition-all duration-200 pointer-events-none peer-placeholder-shown:top-8 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400 peer-focus:top-1 peer-focus:text-xs peer-focus:text-[#800000]'>Full Name</label>
        </div>

        <div className='relative pt-6'>
          <input type='email' id='signup-email' placeholder=' ' className='peer w-full pl-10 pr-4 py-2 bg-transparent text-gray-800 border-b border-gray-300 focus:outline-none focus:border-[#7B0B0E] focus:border-b-2 transition-all' />
          <label htmlFor='signup-email' className='absolute left-10 top-1 text-xs text-[#800000] transition-all duration-200 pointer-events-none peer-placeholder-shown:top-8 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400 peer-focus:top-1 peer-focus:text-xs peer-focus:text-[#800000]'>Email</label>
        </div>

        <div className='relative pt-6'>
          <input type='password' id='signup-password' placeholder=' ' className='peer w-full pl-10 pr-4 py-2 bg-transparent text-gray-800 border-b border-gray-300 focus:outline-none focus:border-[#7B0B0E] focus:border-b-2 transition-all' />
          <label htmlFor='signup-password' className='absolute left-10 top-1 text-xs text-[#800000] transition-all duration-200 pointer-events-none peer-placeholder-shown:top-8 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400 peer-focus:top-1 peer-focus:text-xs peer-focus:text-[#800000]'>Password</label>
        </div>

        <button className='w-full bg-[#800000] hover:bg-[#5C080B] text-white font-semibold py-3.5 rounded-full mt-11.5 mb-11.5 transition-colors'>Create Account</button>
      </form>

      <p className='text-center text-sm text-black font-semibold mt-auto pt-10'>
        Already have an account?{' '}
        <button type='button' onClick={onGoToLogin} className='text-[#7B0B0E] hover:underline'>Log In</button>
      </p>
    </div>
  );
}