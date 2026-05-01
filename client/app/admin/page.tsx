'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';

// Shared Layout Components
import Sidebar from './components/sidebar';
import HeadNavbar from './components/headNavbar';

// Page Components
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
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // 1. Read the active tab from the URL, default to 'Overview'
  const activeTab = searchParams.get('tab') || 'Overview';

  // 2. Create a custom setter function that updates the URL
  const setActiveTab = (tabName: string) => {
    // We update the URL parameter instead of local state
    router.push(`${pathname}?tab=${tabName}`);
  };

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