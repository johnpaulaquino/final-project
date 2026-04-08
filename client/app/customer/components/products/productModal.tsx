'use client';

import React from 'react';
import { Product } from '../../context/contextCart';
import { useCart } from '../../context/contextCart';

interface ProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProductModal({ product, isOpen, onClose }: ProductModalProps) {
  const { addToCart } = useCart();

  if (!isOpen || !product) return null;

  const handleAddToCart = () => {
    addToCart(product);
    onClose();
  };

  // Determine stock color and text
  const isOutOfStock = product.stock <= 0;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-[#0B1527]/60 backdrop-blur-sm">
      
      {/* Modal Container */}
      <div className="bg-white rounded-3xl w-full max-w-[850px] shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh] relative">
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-8 h-8 flex items-center justify-center rounded-full bg-white/80 md:bg-gray-100 hover:bg-gray-200 text-gray-600 transition shadow-sm cursor-pointer"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="relative w-full md:w-[45%] h-[300px] md:h-auto bg-gray-100 flex-shrink-0">
          <img 
            src={product.image.startsWith('/') ? product.image : `/${product.image}`} 
            alt={product.name} 
            className="w-full h-full object-cover"
          />
        </div>

        <div className="w-full md:w-[55%] flex flex-col bg-white h-full max-h-[60vh] md:max-h-[90vh] overflow-y-auto custom-scrollbar">
          <div className="p-6 md:p-8 flex flex-col gap-6">
            
            <div>
              <div className="flex justify-between items-start mb-3">
                <span className="inline-block px-2 py-1 bg-red-50 text-[#800000] text-[10px] font-bold rounded-md">
                  {product.category || 'Signature Drinks'}
                </span>
                
                {/* STOCK DISPLAY */}
                <span className={`px-2 py-1 text-[10px] font-bold rounded-md ${
                  isOutOfStock 
                  ? 'bg-gray-100 text-gray-500' 
                  : 'bg-green-50 text-green-700'
                }`}>
                  {isOutOfStock ? 'Out of Stock' : `${product.stock} in Stock`}
                </span>
              </div>

              <h2 className="text-3xl font-black text-[#0B1527] leading-tight mb-2">
                {product.name}
              </h2>
              <div className="flex items-center gap-2 text-sm">
                <div className="flex items-center text-yellow-400">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                </div>
                <span className="font-bold text-gray-800">{product.rating || '4.9'}</span>
                <span className="text-gray-500">(124 reviews)</span>
              </div>
            </div>

            <p className="text-gray-600 text-sm leading-relaxed">
              {product.description || 'Indulge in our freshly prepared beverage, crafted with premium ingredients to satisfy your cravings.'}
            </p>

            <div className="flex items-center justify-between bg-[#fcfcfc] border border-gray-100 p-4 rounded-2xl">
              <span className="text-3xl font-black text-[#800000]">₱{product.price}</span>
              <button 
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`cursor-pointer font-bold py-3 px-6 rounded-xl transition-colors flex items-center gap-2 shadow-md ${
                  isOutOfStock 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'bg-[#0B1527] hover:bg-gray-800 text-white'
                }`}
              >
                {isOutOfStock ? 'Sold Out' : '+ Add to Cart'}
              </button>
            </div>

            <div>
              <h3 className="font-black text-[#0B1527] mb-3">Nutrition Facts</h3>
              <div className="grid grid-cols-5 gap-2 border border-gray-100 rounded-xl p-3 bg-white text-center">
                <div className="flex flex-col border-r border-gray-100"><span className="text-[9px] font-bold text-gray-400 uppercase">Calories</span><span className="font-bold text-gray-800">240</span></div>
                <div className="flex flex-col border-r border-gray-100"><span className="text-[9px] font-bold text-gray-400 uppercase">Fat</span><span className="font-bold text-gray-800">5g</span></div>
                <div className="flex flex-col border-r border-gray-100"><span className="text-[9px] font-bold text-gray-400 uppercase">Carbs</span><span className="font-bold text-gray-800">35g</span></div>
                <div className="flex flex-col border-r border-gray-100"><span className="text-[9px] font-bold text-gray-400 uppercase">Protein</span><span className="font-bold text-gray-800">2g</span></div>
                <div className="flex flex-col"><span className="text-[9px] font-bold text-gray-400 uppercase">Sugar</span><span className="font-bold text-gray-800">30g</span></div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}