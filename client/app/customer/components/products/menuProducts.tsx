"use client";

import Image from "next/image";
import { useCart, Product } from "../../context/contextCart";

export default function menuProducts({ product }: { product: Product }) {
  const { addToCart } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Logic inside addToCart (contextCart) already prevents adding if stock is 0
    addToCart(product);
  };

  // Stock status logic
  const isOutOfStock = product.quantity <= 0;
  const isLowStock = product.quantity > 0 && product.quantity < 5;

  return (
    <div
      className={`bg-white rounded-[10px] shadow-sm overflow-hidden hover:shadow-md transition duration-300 cursor-pointer flex flex-col group h-full relative ${isOutOfStock ? "opacity-75" : ""}`}
    >
      <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
        {isOutOfStock ? (
          <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm">
            SOLD OUT
          </span>
        ) : isLowStock ? (
          <span className="bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm animate-pulse">
            ONLY {product.quantity} LEFT
          </span>
        ) : (
          <span className="bg-gray-100/80 backdrop-blur-sm text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded-md">
            STOCKED: {product.quantity}
          </span>
        )}
      </div>

      <div className="h-48 w-full relative overflow-hidden bg-gray-100 flex-shrink-0">
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

      <div className="p-5 flex flex-col flex-grow">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1">
            <svg
              className="w-3 h-3 text-yellow-400 fill-current"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-xs font-bold text-gray-700">
              {product.Products.avg_rating}
            </span>
          </div>
          {/* Small Category Label */}
          <span className="text-[10px] text-gray-400 font-medium truncate max-w-[80px]">
            {product.Products.category}
          </span>
        </div>

        <h3 className="text-sm font-bold text-gray-900 leading-snug mb-1 group-hover:text-[#800000] transition-colors">
          {product.Products.product_name}
        </h3>

        {product.Products.description && (
          <p className="text-xs text-gray-500 font-medium mb-4 flex-grow line-clamp-2">
            {product.Products.description}
          </p>
        )}

        <div className="flex items-center justify-between mt-auto pt-4">
          <span
            className={`text-sm font-bold ${isOutOfStock ? "text-gray-400 line-through" : "text-[#800000]"}`}
          >
            ₱{product.Products.price}
          </span>

          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`cursor-pointer flex items-center justify-center w-8 h-8 rounded-full transition-colors ${
              isOutOfStock
                ? "bg-gray-200 cursor-not-allowed"
                : "bg-black hover:bg-gray-800"
            }`}
          >
            <Image
              src="/icons/add-to-cart.png"
              alt="Add to Cart"
              width={10}
              height={10}
              className={isOutOfStock ? "opacity-30" : ""}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
