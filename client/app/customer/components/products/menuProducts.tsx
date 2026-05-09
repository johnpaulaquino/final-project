"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useCart, Product } from "../../context/contextCart";
import { getAccessToken } from "@/lib/api";
import AuthModal from "@/app/auth/authModal";

export default function MenuProducts({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication status on mount
  useEffect(() => {
    const token = getAccessToken();
    setIsAuthenticated(!!token);
  }, []);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      setIsAuthModalOpen(true);
      return;
    }
    // Logic inside addToCart (contextCart) already prevents adding if stock is 0
    addToCart(product);
  };

  // Stock status logic
  const isOutOfStock =
    product.stock_status?.toLocaleLowerCase() === "Out of Stock".toLowerCase();
  const isLowStock =
    product.stock_status?.toLocaleLowerCase() ===
    "Low of Stock".toLocaleLowerCase();

  return (
    <div
      className={`bg-white rounded-[10px] shadow-sm overflow-hidden hover:shadow-md transition duration-300 cursor-pointer flex flex-col group h-full relative ${isOutOfStock ? "opacity-75" : ""}`}
    >

      <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
        {isOutOfStock ? (
          <span className="bg-red-600 text-white text-[9px] md:text-[10px] font-bold px-1.5 md:px-2 py-0.5 rounded-md shadow-sm">
            SOLD OUT
          </span>
        ) : isLowStock ? (
          <span className="bg-orange-500 text-white text-[9px] md:text-[10px] font-bold px-1.5 md:px-2 py-0.5 rounded-md shadow-sm animate-pulse">
            ONLY {product.quantity} LEFT
          </span>
        ) : (
          <span className="bg-gray-100/80 backdrop-blur-sm text-gray-600 text-[9px] md:text-[10px] font-bold px-1.5 md:px-2 py-0.5 rounded-md">
            STOCKED: {product.quantity}
          </span>
        )}
      </div>


      <div className="h-28 sm:h-40 md:h-48 w-full relative overflow-hidden bg-gray-100 flex-shrink-0">
        <img
          src={
            product.images && product.images.length > 0
              ? product.images[0].image_url
              : "/images/placeholder-food.png"
          }
          alt={product.Products.product_name}
          className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${isOutOfStock ? "grayscale" : ""}`}
        />
      </div>

      <div className="p-3 md:p-5 flex flex-col flex-grow">
        <div className="flex items-center justify-between mb-1.5 md:mb-2">
          <div className="flex items-center gap-1">
            <div className="flex items-center text-yellow-400">

              <svg className="w-3 h-3 md:w-4 md:h-4 fill-current" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>

            <span className="text-[10px] md:text-xs font-bold text-gray-800">
              {parseFloat(product.avg_rating?.toFixed(2) || "0")}
            </span>
            <span className="text-[9px] md:text-xs text-gray-500">
              ({product.review_count || 0} reviews)
            </span>
          </div>
          {/* Small Category Label */}
          <span className="text-[9px] md:text-[10px] text-gray-400 font-medium truncate max-w-[60px] md:max-w-[80px]">
            {product.Products.category}
          </span>
        </div>

        {/* 🚀 FIXED: Title shrinks to text-xs on mobile */}
        <h3 className="text-xs md:text-sm font-bold text-gray-900 leading-snug mb-1 group-hover:text-[#800000] transition-colors line-clamp-2 md:line-clamp-1">
          {product.Products.product_name}
        </h3>

        {product.description && (
          <p className="text-[10px] md:text-xs text-gray-500 font-medium mb-2 md:mb-4 flex-grow line-clamp-2">
            {product.description}
          </p>
        )}

        {/* 🚀 FIXED: Tightened top margin on mobile */}
        <div className="flex items-center justify-between mt-auto pt-2 md:pt-4 border-t border-gray-50">
          <span
            className={`text-xs md:text-sm font-bold ${isOutOfStock ? "text-gray-400 line-through" : "text-[#800000]"}`}
          >
            ₱{product.Products.price}
          </span>

          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`cursor-pointer flex items-center justify-center w-7 h-7 md:w-8 md:h-8 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#800000] focus:ring-offset-1 ${
              isOutOfStock
                ? "bg-gray-200 cursor-not-allowed"
                : "bg-black hover:bg-gray-800"
            }`}
            aria-label={`Add ${product.Products.product_name} to cart`}
          >
            <div className="w-2.5 h-2.5 md:w-3 md:h-3 relative">
                <Image
                src="/icons/add-to-cart.png"
                alt=""
                fill
                className={`object-contain ${isOutOfStock ? "opacity-30" : "invert"}`}
                aria-hidden="true"
                />
            </div>
          </button>
        </div>
      </div>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialView="signup"
      />
    </div>
  );
}