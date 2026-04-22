"use client";

import React, { useEffect, useState } from "react";
import { useProduct } from "../../../customer/context/contextProduct";
import EditProductModal from "./editInventoryModal";
import { Product } from "../../../customer/context/contextCart";

export default function InventoryList() {
  // deleteProduct is removed from here since it will be handled inside your modal
  const { products, fetchProducts, updateProduct } = useProduct();
  useEffect(() => {
    // You can adjust skip and limit here if you implement pagination later
    fetchProducts("All", 1, 10);
  }, ["All", fetchProducts]);

  // State for Modal
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Triggered when clicking anywhere on the row
  const handleRowClick = (product: Product) => {
    setSelectedProduct(product);
    setIsEditOpen(true);
  };

  const getStockStatus = (stock: number) => {
    if (stock <= 0)
      return {
        label: "Out of Stock",
        color: "bg-red-100 text-red-600 border-red-200",
      };
    if (stock < 10)
      return {
        label: `Low Stock (${stock})`,
        color: "bg-amber-100 text-amber-600 border-amber-200",
      };
    return {
      label: `${stock} in Stock`,
      color: "bg-emerald-100 text-emerald-600 border-emerald-200",
    };
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2 bg-[#800000]/5 px-4 py-2 rounded-2xl border border-[#800000]/10">
          <span className="w-2 h-2 rounded-full bg-[#800000] animate-pulse"></span>
          <span className="text-[#800000] font-bold text-sm">
            {products.length} Products
          </span>
        </div>
      </div>

      <div className="overflow-hidden border border-gray-100 rounded-[2rem] shadow-xl shadow-gray-200/50 bg-white">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100">
              <th className="py-5 px-6 text-[11px] font-bold text-gray-400 uppercase tracking-[0.1em]">
                Product Info
              </th>
              <th className="py-5 px-4 text-[11px] font-bold text-gray-400 uppercase tracking-[0.1em]">
                Category
              </th>
              <th className="py-5 px-4 text-[11px] font-bold text-gray-400 uppercase tracking-[0.1em]">
                Financials
              </th>
              <th className="py-5 px-4 text-[11px] font-bold text-gray-400 uppercase tracking-[0.1em]">
                Availability
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {products.length > 0 ? (
              products.map((product) => {
                const status = getStockStatus(product.quantity);
                return (
                  <tr
                    key={product.Products.id}
                    onClick={() => handleRowClick(product)}
                    className="hover:bg-gray-50/80 transition-all duration-200 group cursor-pointer"
                  >
                    <td className="py-5 px-6">
                      <div className="flex items-start gap-4">
                        <div className="w-14 h-14 rounded-2xl overflow-hidden bg-gray-100 border-2 border-white shadow-md flex-shrink-0">
                          <img
                            src={
                              product.images[0]?.image_url || "/placeholder.png"
                            }
                            alt={product.Products.product_name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-bold text-gray-900 text-sm group-hover:text-[#800000] transition-colors">
                            {product.Products.product_name}
                          </span>
                          <p className="text-xs text-gray-500 line-clamp-1 mt-1 max-w-[200px]">
                            {product.Products.description}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-5 px-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-100">
                        {product.Products.category || "Uncategorized"}
                      </span>
                    </td>

                    <td className="py-5 px-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-gray-900">
                          ₱{parseFloat(product.Products.price).toLocaleString()}
                        </span>
                        <span className="text-[10px] text-gray-400 font-medium uppercase tracking-tighter">
                          Unit Price
                        </span>
                      </div>
                    </td>

                    <td className="py-5 px-4">
                      <div
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl border text-[11px] font-bold ${status.color}`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${status.color.split(" ")[1].replace("text", "bg")}`}
                        ></span>
                        {status.label}
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={4} className="py-20 text-center">
                  <p className="text-gray-400 font-bold">No Products Found</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <EditProductModal
        isOpen={isEditOpen}
        product={selectedProduct}
        onClose={() => setIsEditOpen(false)}
        onSave={(updated) => updateProduct(updated)}
      />
    </div>
  );
}
