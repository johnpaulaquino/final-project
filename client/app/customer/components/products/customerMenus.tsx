'use client';

import { useState, useEffect } from 'react';
import ProductCard from '../products/menuProducts'; 
import ProductModal from '../products/productModal';
import { Product } from '../../context/contextCart';
import { biskotaMenuData } from '../../data/mockDataCard';

export default function customerMenus() {
  const [products, setProducts] = useState<Product[]>([]);
  const [activeFilter, setActiveFilter] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  const filters = ['All', 'Cinnamon Rolls', 'Savories', 'Cake in a Cup', 'Brownies', 'Cinnamon Bites', 'Pasta', 'Protein Cookies', 'Bento Sizes', 'Drinks', 'Others'];
  
  useEffect(() => {
    const fetchMenu = async () => {
      try {
        setIsLoading(true);
        
        await new Promise(resolve => setTimeout(resolve, 500)); 
        
        // imported the mock data for the menu
        setProducts(biskotaMenuData);
      } catch (error) {
        console.error("Failed to load products", error);
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchMenu();
  }, []);

  useEffect(() => {
    const navbar = document.querySelector('nav');
    if (navbar) {
      if (selectedProduct !== null) {
        navbar.style.visibility = 'hidden';
        navbar.style.opacity = '0';
      } else {
        navbar.style.visibility = 'visible';
        navbar.style.opacity = '1';
      }
    }
    
    return () => {
      if (navbar) {
        navbar.style.visibility = 'visible';
        navbar.style.opacity = '1';
      }
    };
  }, [selectedProduct]);

  const filteredProducts = activeFilter === 'All' 
    ? products 
    : products.filter(product => product.category === activeFilter);

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Menu</h2>
        <p className="text-sm font-medium text-gray-500 mb-6">Fresh and delicious food delivered to your doorstep.</p>
          
        <div className="flex gap-3 overflow-x-auto md:flex-wrap md:overflow-visible pb-4 pt-1 w-full scroll-smooth snap-x md:snap-none scrollbar-hide">
          {filters.map((filter) => (
            <button 
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`cursor-pointer shrink-0 snap-start px-6 py-2 rounded-[5px] text-sm font-bold whitespace-nowrap shadow-sm transition-colors ${
                activeFilter === filter 
                  ? 'bg-[#800000] text-white' 
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>
  
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500 font-medium animate-pulse">Loading menu...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <div 
                key={`menu-item-${product.id}`} 
                onClick={() => setSelectedProduct(product)}
                className="cursor-pointer transition-transform hover:scale-[1.02]"
              >
                <ProductCard product={product} />
              </div>
            ))
          ) : (
            <div className="col-span-full py-12 text-center text-gray-500">
              No products found in "{activeFilter}" right now.
            </div>
          )}
        </div>
      )}
        
      <ProductModal 
        isOpen={!!selectedProduct}
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  );
}