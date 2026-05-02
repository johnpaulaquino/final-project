"use client";

import React, { useState } from "react";
import { Product } from "../../context/contextCart";
import { useCart } from "../../context/contextCart";

interface ProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

const MOCK_REVIEWS = [
  {
    id: 1,
    user: "John Paul Aquino",
    rating: 5,
    date: "Oct 12, 2025",
    comment: "Absolutely delicious!",
  },
  {
    id: 2,
    user: "Khate Bravante",
    rating: 4,
    date: "Oct 10, 2025",
    comment: "Tastes Good for me",
  },
  {
    id: 3,
    user: "Prince Raven Alpiedam",
    rating: 5,
    date: "Sep 28, 2025",
    comment: "Good Job",
  },

  {
    id: 4,
    user: "Marck Andrei Larazo",
    rating: 4,
    date: "Sep 28, 2025",
    comment: "Delicious",
  },

  {
    id: 5,
    user: "Luigee Espiritu",
    rating: 5,
    date: "Sep 28, 2025",
    comment: "Nice",
  },
];

export default function ProductModal({ product, isOpen, onClose }: ProductModalProps) {
  const { addToCart } = useCart();

  const [viewingAllReviews, setViewingAllReviews] = useState(false);

  if (!isOpen || !product) return null;

  const handleAddToCart = () => {
    addToCart(product);
    onClose();
  };

  const isOutOfStock = product.quantity <= 0;
  const fallbackImage = "/images/placeholder-food.png";
  const displayImage = product.images && product.images.length > 0 ? product.images[0].image_url : fallbackImage;

  const displayedReviews = MOCK_REVIEWS.slice(0, 3);
  const totalReviews = MOCK_REVIEWS.length;

  const renderStars = (rating: number) => {
    return (
      <div className="flex text-yellow-400">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-3.5 h-3.5 ${star <= rating ? "fill-current" : "text-gray-200 fill-current"}`}
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  const ReviewItem = ({ review }: { review: any }) => (
    <div className="flex flex-col gap-2 mb-5 last:mb-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#800000] text-white flex items-center justify-center text-xs font-bold">
            {review.user.charAt(0)}
          </div>
          <div>
            <p className="text-sm font-bold text-gray-800">{review.user}</p>
            {renderStars(review.rating)}
          </div>
        </div>
        <span className="text-[10px] text-gray-400 font-medium">{review.date}</span>
      </div>
      <p className="text-sm text-gray-600 leading-relaxed pl-10">
        "{review.comment}"
      </p>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
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
          <img src={displayImage} alt={product.Products.product_name} className="w-full h-full object-cover" />
        </div>

        <div className="w-full md:w-[55%] flex flex-col bg-white h-full max-h-[60vh] md:max-h-[90vh] overflow-y-auto custom-scrollbar">
          <div className="flex flex-col gap-6">
            
            {viewingAllReviews ? (
            <div className="p-6 md:p-8 flex flex-col animate-in slide-in-from-right-4 duration-300">
              <button 
                onClick={() => setViewingAllReviews(false)}
                className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-[#800000] transition-colors mb-6 w-max"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Product
              </button>

              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                <h2 className="text-2xl font-black text-[#0B1527]">All Reivews</h2>
                <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-bold">
                  {totalReviews} Reviews
                </span>
              </div>

              <div className="flex flex-col">
                {MOCK_REVIEWS.map((review) => (
                  <ReviewItem key={review.id} review={review} />
                ))}
              </div>
            </div>
          ) : (
            
            <div className="p-6 md:p-8 flex flex-col gap-6 animate-in slide-in-from-left-4 duration-300">
            <div>
              <div className="flex justify-between items-start mb-3">
                <span className="inline-block px-2 py-1 bg-red-50 text-[#800000] text-[10px] font-bold rounded-md">
                  {product.Products.category || "Signature Drinks"}
                </span>
                <span className={`px-2 py-1 text-[10px] font-bold rounded-md ${isOutOfStock ? "bg-gray-100 text-gray-500" : "bg-green-50 text-green-700"}`}>
                  {isOutOfStock ? "Out of Stock" : `${product.quantity} in Stock`}
                </span>
              </div>

              <h2 className="text-3xl font-black text-[#0B1527] leading-tight mb-2">
                {product.Products.product_name}
              </h2>
              <div className="flex items-center gap-2 text-sm">
                <div className="flex items-center text-yellow-400">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
                <span className="font-bold text-gray-800">
                  {product.avg_rating || "0.0"}
                </span>
                {/* DYNAMIC REVIEW COUNT HERE */}
                <span className="text-gray-500">
                  ({product.review_count || 0} reviews)
                </span>
              </div>
            </div>

            <p className="text-gray-600 text-sm leading-relaxed">
              {product.description || "Indulge in our freshly prepared beverage, crafted with premium ingredients."}
            </p>

            <div className="flex items-center justify-between bg-[#fcfcfc] border border-gray-100 p-4 rounded-2xl">
              <span className="text-3xl font-black text-[#800000]">₱{product.Products.price}</span>
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`cursor-pointer font-bold py-3 px-6 rounded-xl transition-colors flex items-center gap-2 shadow-md ${isOutOfStock ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-[#0B1527] hover:bg-gray-800 text-white"}`}
              >
                {isOutOfStock ? "Sold Out" : "+ Add to Cart"}
              </button>
            </div>
            
            {/* Customer Reviews Section */}
            <div className="border-t border-gray-100 pt-6 mt-2">
                <h3 className="font-black text-[#0B1527] mb-4">Customer Reviews</h3>
                
                <div className="flex flex-col">
                  {displayedReviews.map((review) => (
                    <ReviewItem key={review.id} review={review} />
                  ))}
                </div>

                {/* Show this if there are no reviews yet */}
                {totalReviews === 0 && (
                  <p className="text-sm text-gray-500 italic text-center py-4">
                    No reviews yet. Be the first to try it!
                  </p>
                )}

                {/* See All Button */}
                {totalReviews > 3 && (
                  <button
                    onClick={() => setViewingAllReviews(true)}
                    className="cursor-pointer w-full mt-2 py-3 border border-gray-200 text-gray-700 text-sm font-bold rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    See All {totalReviews} Reviews
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
       </div>
     </div>
    </div> 
  );
}