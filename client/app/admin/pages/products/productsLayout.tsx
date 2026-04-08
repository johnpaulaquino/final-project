import React from 'react';
import ProductTabs from '../../components/productTabs'; // Adjust path if needed
import InventoryList from './inventoryListPage';
import AddItem from './addProductPage';
import Categories from './categoriesPage';
import Carousel from './carousel';

interface ProductsLayoutProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function ProductsLayout({ activeTab, setActiveTab }: ProductsLayoutProps) {
  
  const renderProductContent = () => {
    switch (activeTab) {
      case 'Inventory List': return <InventoryList />;
      case 'Add Item': return <AddItem />;
      case 'Categories': return <Categories />;
      case 'Carousel': return <Carousel />;
      default: return <InventoryList />;
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 min-h-[500px]">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-6 border-b border-gray-100 gap-4">
        <h2 className="text-xl font-bold text-[#0B1527]">Menu & Products</h2>
        <ProductTabs activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>

      <div className="animate-in fade-in duration-300">
        {renderProductContent()}
      </div>

    </div>
  );
}