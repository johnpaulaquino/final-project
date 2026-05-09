'use client';

import Navbar from "./components/headNavbar"; 
import HomePage from "./components/homepage";
import { useRouter, usePathname, useSearchParams } from "next/navigation";


export default function Home() {

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