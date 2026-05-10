'use client';

import { Suspense } from "react";
import Navbar from "./components/headNavbar"; 
import HomePage from "./components/homepage";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

// 1. Isolate the logic that depends on URL parameters into its own component
function HomeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const activeTab = searchParams.get("tab") || "Home";

  const setActiveTab = (tabName: string) => {
    router.push(`${pathname}?tab=${tabName}`);
  };

  return (
    <div className='min-h-screen font-sans text-slate-800 bg-gradient-to-b from-white via-rose-50 to-rose-100 flex flex-col'>
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab}/>

      <div className="min-h-screen bg-[#F4F4F5] relative pb-20">
          <HomePage setActiveTab={setActiveTab} />
      </div>
    </div>
  );
}

// 2. Export your main page and wrap the content in a Suspense boundary
export default function Home() {
  return (
    // You can customize this fallback UI (e.g., adding a spinner)
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-slate-500 font-medium animate-pulse">Loading...</p>
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}