'use client';

import Image from "next/image";
import Navbar from "./components/headNavbar"; 
import HomePage from "./components/homepage";

export default function Home() {

  return (
    <div className='min-h-screen font-sans text-slate-800 bg-gradient-to-b from-white via-50 to-rose-100'>
      <div>
        <Navbar />
      </div>

      <div>
        <HomePage />
      </div>
    </div>
  );
}
