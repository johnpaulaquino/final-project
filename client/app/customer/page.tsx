'use client';

import { useState } from 'react';
import HeaderNavbar from './components/headNavbar';
import Homepage from './pages/homePage';
import Menu from './pages/menuPage';
import Deals from './pages/dealsPage';
import Checkout from './pages/checkoutPage';
import AccountSetting from './pages/accountSettingPage';
import Chatbot from './components/chatbot/chatBot';


export default function Page() {
  const [activeTab, setActiveTab] = useState('Home');
  return (
    <div className="min-h-screen bg-white">
        <HeaderNavbar activeTab={activeTab} setActiveTab={setActiveTab} />
        
      <div className="min-h-screen bg-[#F4F4F5] relative pb-20">
        
        {/**/}
        {activeTab === 'Home' && <Homepage setActiveTab={setActiveTab} />}
        {activeTab === 'Menu' && <Menu setActiveTab={setActiveTab} />}
        {activeTab === 'Deals' && <Deals />}
        {activeTab === 'Checkout' && <Checkout />}
        {activeTab === 'AccountSetting' && <AccountSetting />}
        <Chatbot/>
      </div>

    </div>
  );
}
