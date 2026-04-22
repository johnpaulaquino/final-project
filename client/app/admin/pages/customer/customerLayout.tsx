import React from 'react'
import CustomerTabs from '../../components/customerTabs';
import CustomerList from './customerPage';
import SalesHistory from './historySalesPage';
import OrderManagement from './orderManagementPage';  


interface customerLayoutProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function customerLayout({ activeTab, setActiveTab }: customerLayoutProps) {

  const renderCustomerContent = () => {
    switch (activeTab) {
      case 'Customer List': return <CustomerList />;
      case 'Sales History': return <SalesHistory />;
      case 'Order Management': return <OrderManagement />;
      default: return <CustomerList />;
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 min-h-[500px]">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-6 border-b border-gray-100 gap-4">
            <h2 className="text-xl font-bold text-[#0B1527]">People & Sales</h2>
            <CustomerTabs activeTab={activeTab} setActiveTab={setActiveTab} />
          </div>
    
          <div className="animate-in fade-in duration-300">
            {renderCustomerContent()}
          </div>
    
    </div>
  );
};