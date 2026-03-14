'use client';

import { useState } from 'react';
import HeaderNavbar from './components/headNavbar';
import Homepage from './pages/homePage';
import Menu from './pages/menuPage';
import Deals from './pages/dealsPage';

export default function Page() {
  const [activeTab, setActiveTab] = useState('Home');
  return (
    <div className="min-h-screen bg-white">
      
      <HeaderNavbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="min-h-screen bg-[#F4F4F5] relative pb-20">
        
        {/**/}
        {activeTab === 'Home' && <Homepage />}
        {activeTab === 'Menu' && <Menu />}
        {activeTab === 'Deals' && <Deals />}

      </div>

    </div>
  );
}
