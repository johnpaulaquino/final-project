'use client';

import Image from 'next/image';
import { useCart, Product } from '../../context/contextCart';

export default function menuProducts({ product }: { product: Product }) {
  const { addToCart } = useCart();

  return (
    <div className="bg-white rounded-[10px] shadow-sm overflow-hidden hover:shadow-md transition duration-300 cursor-pointer flex flex-col group">
      
      {/* Product Image */}
      <div className="h-48 w-full relative overflow-hidden bg-gray-100 flex-shrink-0">
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
        />
      </div>
      
      {/* Product Details */}
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex items-center gap-1 mb-2">
          
          <span className="text-xs font-bold text-gray-700">{product.rating}</span>
        </div>
        
        <h3 className="text-sm font-bold text-gray-900 leading-snug mb-1 group-hover:text-[#800000] transition-colors">
          {product.name}
        </h3>
        
        {product.description && (
          <p className="text-xs text-gray-500 font-medium mb-4 flex-grow">
            {product.description}
          </p>
        )}
        
        <div className="flex items-center justify-between mt-4">
          <span className="text-sm font-bold text-[#800000]">{product.price}</span>
          <button
            onClick={() => addToCart(product)} 
            className="cursor-pointer flex items-center justify-center w-8 h-8 rounded-full bg-black hover:bg-gray-800 transition-colors"
          >
            
            <Image 
              src="/icons/add-to-cart.png" 
              alt="Add to Cart" 
              width={10} 
              height={10} 
            />
          </button>
        </div>
      </div>

    </div>
  );
}