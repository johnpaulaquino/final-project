"use client";

import React, { useState, useEffect } from "react";

interface RatingModalProps {
  isOpen: boolean;
  productName?: string;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (rating: number, review: string) => void;
}

export default function RatingModal({
  isOpen,
  productName = "your treats",
  isSubmitting,
  onClose,
  onSubmit,
}: RatingModalProps) {
  const [rating, setRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [review, setReview] = useState<string>("");

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setRating(0);
      setHoveredRating(0);
      setReview("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (rating === 0) return;
    onSubmit(rating, review);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
        <h3 className="text-xl font-bold text-[#0B1527] mb-2 text-center">
          Rate Your Purchase
        </h3>
        <p className="text-sm text-gray-500 text-center mb-6">
          How did you like {productName}? Your feedback helps us bake better experiences!
        </p>

        {/* Star Rating Selection */}
        <div className="flex justify-center gap-2 mb-6">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              className="focus:outline-none transition-transform hover:scale-110"
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              onClick={() => setRating(star)}
            >
              <svg
                className={`w-10 h-10 transition-colors ${
                  (hoveredRating || rating) >= star
                    ? "text-[#FFD700] fill-[#FFD700]"
                    : "text-gray-300 fill-transparent"
                }`}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </button>
          ))}
        </div>

        {/* Review Text Area */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Add a written review (optional)
          </label>
          <textarea
            value={review}
            onChange={(e) => setReview(e.target.value)}
            placeholder="Tell us what you loved about it..."
            className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-[#800000] focus:border-[#800000] outline-none resize-none h-28"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 w-full">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors disabled:opacity-50"
          >
            Skip
          </button>
          <button
            onClick={handleSubmit}
            disabled={rating === 0 || isSubmitting}
            className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-[#800000] hover:bg-[#600000] rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isSubmitting ? (
              <span className="animate-pulse">Submitting...</span>
            ) : (
              "Submit Rating"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}