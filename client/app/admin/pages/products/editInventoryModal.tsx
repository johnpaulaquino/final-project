"use client";

import React, { useState, useEffect } from "react";
import { Product } from "../../../customer/context/contextCart";

interface EditModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedProduct: Product) => void;
}

export default function EditProductModal({
  product,
  isOpen,
  onClose,
  onSave,
}: EditModalProps) {
  const [formData, setFormData] = useState<Product | null>(null);

  // Sync internal state when a product is selected
  useEffect(() => {
    if (product) setFormData({ ...product });
  }, [product]);

  if (!isOpen || !formData) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({
          ...formData,
          Products: {
            ...formData.Products,
            images: reader.result as string | [],
          },
        });
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-[#0B1527]/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white rounded-[2.5rem] w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-2xl font-black text-[#0B1527]">
                Edit Product
              </h3>
              <p className="text-sm text-gray-500">
                Update details for {product?.Products.product_name}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 bg-gray-100 rounded-full text-gray-400 hover:text-gray-900 transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase ml-1">
                  Product Name
                </label>
                <input
                  type="text"
                  value={formData.Products.product_name || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      Products: {
                        ...formData.Products,
                        product_name: e.target.value,
                      },
                    })
                  }
                  className="p-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:border-[#800000] font-medium"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase ml-1">
                  Price (₱)
                </label>
                <input
                  type="number"
                  value={formData.Products.price || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      Products: { ...formData.Products, price: e.target.value },
                    })
                  }
                  className="p-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:border-[#800000] font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase ml-1">
                  Stock Level
                </label>
                <input
                  type="number"
                  value={formData.quantity ?? 0} // Added ?? 0 for numbers
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      quantity: parseInt(e.target.value) || 0,
                    })
                  }
                  className="p-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:border-[#800000] font-medium"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase ml-1">
                  Image
                </label>
                <input
                  type="file"
                  onChange={handleImageChange}
                  className="text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-red-50 file:text-[#800000] hover:file:bg-red-100"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase ml-1">
                Description
              </label>
              <textarea
                rows={3}
                value={formData.Products.description || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    Products: {
                      ...formData.Products,
                      description: e.target.value,
                    },
                  })
                }
                className="p-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:border-[#800000] resize-none font-medium"
              ></textarea>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-4 bg-gray-100 text-gray-600 font-bold rounded-2xl hover:bg-gray-200 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-4 bg-[#800000] text-white font-bold rounded-2xl hover:bg-red-900 shadow-lg shadow-red-200 transition-all active:scale-95"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
