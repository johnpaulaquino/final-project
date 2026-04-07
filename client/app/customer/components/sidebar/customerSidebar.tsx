'use client';

import { useState, useEffect } from 'react';
import SideProducts from './sideProducts';
import ProductModal from '../products/productModal'; 

export interface Product {
  id: number | string; 
  name: string;
  price: string;
  rating: string;
  image: string;
  description?: string;
  category?: string;
}

interface CustomerSidebarProps {
  setActiveTab?: (tab: string) => void;
}

export default function customerSidebar({ setActiveTab }: CustomerSidebarProps) {
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [newProducts, setNewProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    // mock data para sa best sellers at new products
    const fetchProduct = () => {
      try {
        const mockData: Product[] = [
          { id: 1, 
            name: 'Dubai Cinnamon Rolls', 
            price: '₱100', 
            rating: '4.8', 
            image: '/products/dubai-cinnamon-rolls.jpg' },

          { id: 2, 
            name: 'Tiramisu Cinnamon Rolls', 
            price: '₱95', 
            rating: '4.9', 
            image: '/products/tiramisu-cinnamon-rolls.jpg' },

          { id: 3, 
            name: 'Korean Garlic Bun', 
            price: '₱95', 
            rating: '5.0',
            image: '/products/korean-garlic-bun.jpg' }
        ];
      
        setBestSellers(mockData);
        setNewProducts(mockData);

      } catch (error) {
        console.error("Failed to load recommended products", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, []);
  
  // for hiding the Navbar whenever the modal is open
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
  
  if (isLoading) {
      return (
        <aside className="w-full xl:w-[320px] bg-white rounded-[10px] p-6 shadow-sm flex-shrink-0 h-max flex justify-center items-center">
          <p className="text-gray-500 font-medium animate-pulse">Loading items...</p>
        </aside>
      );
    }
    
  return (
    <>
      <aside className="w-full xl:w-[320px] bg-white rounded-[10px] p-6 shadow-xl flex-shrink-0 h-max relative z-10">
        
        {/* best seller */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-900">Best Seller</h2>
            <button 
              onClick={() => setActiveTab && setActiveTab('Menu')}
              className="text-xs font-bold text-[#800000] hover:underline">View all</button>
          </div>
          <div className="flex flex-col gap-4">

            {bestSellers.length > 0 ? (
              bestSellers.map((item, index) => (
                // ADDED: Wrapper div to make the card clickable
                <div 
                  key={`best-${item.id}-${index}`} 
                  onClick={() => setSelectedProduct(item)}
                  className="cursor-pointer transition-transform hover:scale-[1.02]"
                >
                  <SideProducts item={item} />
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">No best sellers yet.</p>
            )}

          </div>
        </div>

        <div className="h-[1px] w-full bg-gray-100 mb-8"></div>

        {/* new products */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-6">New Product</h2>
          
          <div className="flex flex-col gap-4">
            
            {newProducts.length > 0 ? (
              newProducts.slice(0, 4).map((item, index) => (
                <div 
                  key={`new-${item.id}-${index}`} 
                  onClick={() => setSelectedProduct(item)}
                  className="cursor-pointer transition-transform hover:scale-[1.02]"
                >
                  <SideProducts item={item} />
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">
                No new products available.
              </p>
            )}

          </div>
        </div>
        
      </aside>

      <ProductModal 
        isOpen={!!selectedProduct}
        product={selectedProduct as any}
        onClose={() => setSelectedProduct(null)}
      />
    </>
  );
}