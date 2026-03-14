'use client';

import{ useState, useEffect } from 'react';
import SideProducts from './sideProducts';

export interface Product {
  id: number;
  name: string;
  price: string;
  rating: string;
  image: string;
}

export default function customerS() {
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [newProducts, setNewProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // mock data para sa best sellers at new products
    const fetchProduct = () => {
      try {
      const mockData: Product[] = [
        { id: 1, 
          name: 'Chocolate Roll Bites', 
          price: '$0.80', rating: '4.8', 
          image: '' },

        { id: 2, 
          name: 'Strawberry Pastry', 
          price: '$1.20', rating: '4.9', 
          image: '' },

        { id: 3, 
          name: 'Matcha Treat', 
          price: '$1.50', 
          rating: '5.0', 
          image: '' }
      ];
      
      setBestSellers(mockData);
      setNewProducts(mockData);
      setIsLoading(false);
      
    
    } catch (error) {
        console.error("Failed to load recommended products", error);
    } finally {
        setIsLoading(false);
    }

    };

    fetchProduct();
  }, []);
  
  if (isLoading) {
      return (
        <aside className="w-full xl:w-[320px] bg-white rounded-[10px] p-6 shadow-sm flex-shrink-0 h-max flex justify-center items-center">
          <p className="text-gray-500 font-medium animate-pulse">Loading items...</p>
        </aside>
      );
    }
  return (
    <aside className="w-full xl:w-[320px] bg-white rounded-[10px] p-6 shadow-xl flex-shrink-0 h-max">
      
      {/* best seller */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-gray-900">Best Seller</h2>
          <button className="text-xs font-bold text-[#800000] hover:underline">View all</button>
        </div>
        <div className="flex flex-col gap-4">

          {bestSellers.length > 0 ? (
            bestSellers.map((item, index) => (
              <SideProducts 
                key={`best-${item.id}-${index}`} 
                item={item} />
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
              <SideProducts 
                key={`new-${item.id}-${index}`} 
                item={item} />
            ))
          ) : (
            <p className="text-sm text-gray-500">
              No new products available.
            </p>
          )}

        </div>
      </div>
      
    </aside>
  );
}