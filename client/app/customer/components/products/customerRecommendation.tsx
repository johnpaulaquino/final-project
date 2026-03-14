'use client';

import { useState, useEffect } from 'react';
import ProductCard, { Product } from './menuProducts';

export default function customerRecommendation() {
  const [products, setProducts] = useState<Product[]>([]);
    const [activeFilter, setActiveFilter] = useState('All');
    const [isLoading, setIsLoading] = useState(true);
    
    const filters = ['All', 'Drinks', 'Pastries'];
    
    useEffect(() => {
      const fetchMenu = async () => {
        try {
          const mockData: Product[] = Array(8).fill({
            id: Math.random(),
            name: 'Hot Chocolate Zero Sugar',
            description: 'Hot chocolate made with Magianhut fresh cocoa.',
            price: '$8.00',
            rating: '4.8',
            category: 'Drinks',
            image: 'logo.jpg'
          }).map((item, index) => ({ ...item, id: index + 1 }));
    
          setProducts(mockData);
        } catch (error) {
          console.error("Failed to load recommended products", error);
        } finally {
          setIsLoading(false);
        }
      };
    
        fetchMenu();
      }, []);
    
    return (
      <div>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Menu</h2>
          <p className="text-sm font-medium text-gray-500 mb-6">Fresh and delicious food delivered to your doorstep.</p>
            
          {/* filter buttons */}
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {filters.map((filter) => (
              <button 
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-6 py-2 rounded-full text-sm font-bold whitespace-nowrap shadow-sm transition-colors ${
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
    
        {/* product grid */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-500 font-medium animate-pulse">Loading menu...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={`recommended-${product.id}`} product={product} />
            ))}
          </div>
        )}
          
      </div>
    );
  }