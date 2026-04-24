'use client';

import { useState } from 'react';

// Shared Layout Components
import Sidebar from './components/sidebar';
import HeadNavbar from './components/headNavbar';

// Page Components (You will need to create these files)
import Overview from './pages/overviewPage';
import Notifications from './pages/notifications/adminNotificationPage';
import Analytics from './pages/analyticsPage';

import ProductsLayout from './pages/products/productsLayout';
import CustomerLayout from './pages/customer/customerLayout';
import NotificationLayout from './pages/notifications/notificationLayout';

import InventoryCheck from './pages/inventoryCheckPage';

// Customer Pages
import CustomerList from './pages/customer/customerPage';
import SalesHistory from './pages/customer/historySalesPage';
import OrderManagement from './pages/customer/orderManagementPage';

export default function AdminPage() {
  // Default to the Overview dashboard on load
  const [activeTab, setActiveTab] = useState('Overview');

  // Helper function to render the correct component
  const renderContent = () => {
    
    

    // 1. If the tab belongs to products, render the smooth Wrapper!
    const productTabs = ['Inventory List', 'Add Item', 'Categories', 'Carousel'];
    
    if (productTabs.includes(activeTab)) {
      return <ProductsLayout activeTab={activeTab} setActiveTab={setActiveTab} />;
    }

    const customerTabs = ['Customer List', 'Sales History', 'Order Management'];

    if (customerTabs.includes(activeTab)) {
      return <CustomerLayout activeTab={activeTab} setActiveTab={setActiveTab} />;
    }

    const notificationTabs = ['Admin Inbox', 'Send to Customer'];

    if (notificationTabs.includes(activeTab)) {
      return <NotificationLayout activeTab={activeTab} setActiveTab={setActiveTab} />;
    }

    // 2. Otherwise, render normal top-level pages
    switch (activeTab) {
      case 'Overview': return <Overview />;
      case 'Notifications': return <Notifications />;
      case 'Analytics': return <Analytics />;
      case 'Inventory Check': return <InventoryCheck />;
      
      // Customers Sub-menu
      case 'Customer List': return <CustomerList />;
      case 'Sales History': return <SalesHistory />;
      case 'Order Management': return <OrderManagement />;

      default: return <Overview />;
    }
  };

  return (
    <div className="flex h-screen bg-[#fafafa] overflow-hidden">
      
      {/* LEFT: The fixed sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      {/* RIGHT: The main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* Top Header (Passes activeTab so it can display the correct page title) */}
        <HeadNavbar activeTab={activeTab} />
        
        {/* Scrollable Main Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
          {renderContent()}
        </main>

      </div>
    </div>
  );
}