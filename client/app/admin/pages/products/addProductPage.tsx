"use client";
import React, { useState, useEffect } from "react";

import { useProduct } from "../../../customer/context/contextProduct";
import { useCategory } from "../../../customer/context/contextCategory";
import { Product } from "../../../customer/context/contextCart";
import { apiClient } from "@/lib/api";

const dataURLtoBlob = (dataurl: string) => {
  const arr = dataurl.split(",");
  const mime = arr[0].match(/:(.*?);/)?.[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
};

export default function AddItem() {
  const { addProduct } = useProduct();
  const { categories } = useCategory();

  const [fileName, setFileName] = useState("No file chosen");
  const [imageBase64, setImageBase64] = useState<string>(
    "/products/placeholder.jpg",
  );

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");

  // --- FIXED: Initialize as empty string, we will set default in useEffect ---
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // --- FIXED: Wait for categories to load, then set the default selection ---
  useEffect(() => {
    if (categories.length > 0 && !category) {
      setCategory(categories[0].category); // Defaults to the first category's name
    }
  }, [categories, category]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setFileName(file.name);

      const reader = new FileReader();

      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 800;
          let width = img.width;
          let height = img.height;

          if (width > MAX_WIDTH) {
            height = height * (MAX_WIDTH / width);
            width = MAX_WIDTH;
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);

          const compressedBase64 = canvas.toDataURL("image/jpeg", 0.7);
          setImageBase64(compressedBase64);
        };

        img.src = event.target?.result as string;
      };

      reader.readAsDataURL(file);
    } else {
      setFileName("No file chosen");
      setImageBase64("/products/placeholder.jpg");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !price) {
      alert("Please fill in the product name and price!");
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("product_name", name);
      formData.append("price", price);
      formData.append("quantity", stock || "0");

      // --- FIXED: 'category' is already a string now, so no need for category.category ---
      formData.append("category", category);

      formData.append("description", description);
      formData.append("low_stock_threshold", "5");

      if (imageBase64 && imageBase64 !== "/products/placeholder.jpg") {
        const imageBlob = dataURLtoBlob(imageBase64);
        formData.append("images", imageBlob, fileName);
      }

      const response = await apiClient.post("/products/", formData);

      alert(`Success! "${name}" has been published to the menu.`);

      setName("");
      setPrice("");
      setStock("");
      setDescription("");
      setFileName("No file chosen");
      setImageBase64("/products/placeholder.jpg");

      
      if (categories.length > 0) {
        setCategory(categories[0].category);
      }
    } catch (error: any) {
      console.error("Failed to add product:", error);
      alert(
        error?.message ||
          "Failed to publish product. Please check your backend.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="bg-white p-6 md:p-8 rounded-[10px] border border-gray-100 shadow-sm">
        <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
          {/* Product Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wide ml-1">
              Product Name
            </label>
            <input
              required
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Ultimate Chocolate Chip"
              className="w-full p-3.5 rounded-[10px] border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:border-[#800000] focus:ring-1 focus:ring-[#800000] transition-colors font-medium"
            />
          </div>

          {/* Price & Stock Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wide ml-1">
                Price (₱)
              </label>
              <input
                required
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                className="w-full p-3.5 rounded-[10px] border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:border-[#800000] focus:ring-1 focus:ring-[#800000] transition-colors font-medium"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wide ml-1">
                Initial Stock
              </label>
              <input
                type="number"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                placeholder="e.g. 50"
                className="w-full p-3.5 rounded-[10px] border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:border-[#800000] focus:ring-1 focus:ring-[#800000] transition-colors font-medium"
              />
            </div>
          </div>

          {/* Category & Upload Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Category Dropdown */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wide ml-1">
                Category
              </label>
              <div className="relative">
                {/* --- FIXED: value is now safely just the 'category' string --- */}
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-3.5 rounded-[10px] border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:border-[#800000] focus:ring-1 focus:ring-[#800000] transition-colors appearance-none pr-10 font-medium text-gray-700"
                >
                  {categories.length > 0 ? (
                    categories.map((cat) => (
                      // --- FIXED: Extract cat.id for the key and cat.category for the text ---
                      <option key={cat.id} value={cat.category}>
                        {cat.category}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>
                      Loading categories...
                    </option>
                  )}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-400">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Custom File Upload */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wide ml-1">
                Upload Image
              </label>
              <div className="flex items-center p-1.5 rounded-[10px] border border-gray-200 bg-white h-[52px]">
                <label className="cursor-pointer bg-red-50 text-[#800000] hover:bg-red-100 transition-colors text-xs font-bold px-4 py-2 rounded-[5px] flex-shrink-0 h-full flex items-center">
                  Choose File
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                    accept="image/*"
                  />
                </label>
                <span className="ml-3 text-sm text-gray-500 truncate">
                  {fileName}
                </span>
              </div>
            </div>
          </div>

          {/* Description Textarea */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wide ml-1">
              Description
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Product details, ingredients, or flavor profile..."
              className="w-full p-3.5 rounded-[10px] border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:border-[#800000] focus:ring-1 focus:ring-[#800000] transition-colors resize-none font-medium placeholder-gray-400"
            ></textarea>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="mt-2 bg-[#800000] hover:bg-red-900 text-white font-bold py-3.5 px-8 rounded-[10px] w-full transition-all active:scale-95 shadow-sm flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Publish Product
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
