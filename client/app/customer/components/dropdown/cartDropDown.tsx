"use client";

import React, { useEffect, useState } from "react";
import { useCart } from "../../context/contextCart";

export default function CartDropDown({
  setActiveTab,
}: {
  setActiveTab: (tab: string) => void;
}) {
  const { fetchCarts, cart, updateQuantity, removeFromCart, setCheckoutItems } =
    useCart();

  const [selectedItems, setSelectedItems] = useState<(string | number)[]>([]);

  useEffect(() => {
    fetchCarts(1, 10);
  }, []);

  useEffect(() => {
    if (cart.length > 0) {
      setSelectedItems(cart.map((item) => item.Products.id));
    } else {
      setSelectedItems([]);
    }
  }, [cart.length]);

  const isAllSelected = cart.length > 0 && selectedItems.length === cart.length;

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedItems([]);
    } else {
      setSelectedItems(cart.map((item) => item.Products.id));
    }
  };

  const handleSelectItem = (id: string | number) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter((itemId) => itemId !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };

  // --- NEW: Helper function to confirm before removing an item ---
  const handleRemoveWithConfirmation = (id: string | number) => {
    if (
      window.confirm(
        "Are you sure you want to remove this item from your cart?",
      )
    ) {
      removeFromCart(id);
    }
  };

  const selectedCartItems = cart.filter((item) =>
    selectedItems.includes(item.Products.id),
  );

  const selectedTotalItems = selectedCartItems.length;

  const selectedTotalPrice = selectedCartItems.reduce(
    (total, item) => total + Number(item.Products.price) * item.Carts.quantity,
    0,
  );

  const handleCheckout = () => {
    setCheckoutItems(selectedItems);
    setActiveTab("Checkout");
  };

  return (
    <div className="absolute top-12 right-0 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 p-5 z-50">
      <div className="flex justify-between items-center border-b border-gray-100 pb-4 mb-4">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={isAllSelected}
            onChange={handleSelectAll}
            className="w-4 h-4 accent-[#800000] cursor-pointer rounded"
          />
          <h2 className="text-gray-900 font-bold text-lg">Your Cart</h2>
        </div>
        <span className="bg-[#800000] text-white text-xs font-bold px-2 py-1 rounded-full">
          {selectedTotalItems} items
        </span>
      </div>

      <div className="flex flex-col gap-4 mb-4 max-h-[260px] overflow-y-auto pr-2 scrollbar-thin">
        {cart.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-4">
            Your cart is empty.
          </p>
        ) : (
          cart.map((item) => {
            const isSelected = selectedItems.includes(item.Products.id);

            return (
              <div
                key={item.Products.id}
                className={`flex gap-3 items-center group p-1 rounded-xl transition-colors ${
                  isSelected ? "bg-red-50/30" : ""
                }`}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => handleSelectItem(item.Products.id)}
                  className="w-4 h-4 accent-[#800000] cursor-pointer flex-shrink-0 rounded"
                />

                <div
                  className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 cursor-pointer"
                  onClick={() => handleSelectItem(item.Products.id)}
                >
                  <img
                    src={
                      item.images && item.images.length > 0
                        ? item.images[0].image_url
                        : "/images/placeholder-food.png"
                    }
                    alt={item.Products.product_name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-grow flex flex-col justify-between h-16">
                  <div className="flex justify-between items-start">
                    <h3
                      className="text-sm font-bold text-gray-900 line-clamp-1 pr-2 cursor-pointer"
                      onClick={() => handleSelectItem(item.Products.id)}
                    >
                      {item.Products.product_name}
                    </h3>

                    {/* ADDED: Use handleRemoveWithConfirmation for the trash button */}
                    <button
                      onClick={() =>
                        handleRemoveWithConfirmation(item.Products.id)
                      }
                      className="text-gray-400 hover:text-red-500 transition-colors p-1 -mr-1 flex-shrink-0 cursor-pointer"
                      title="Remove item"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>

                  <div className="flex justify-between items-end">
                    <span className="text-[#800000] font-bold text-sm">
                      ₱{item.Products.price}
                    </span>

                    <div className="flex items-center bg-gray-50 rounded-lg border border-gray-100">
                      {/* ADDED: Use handleRemoveWithConfirmation for the minus button when quantity is 1 */}
                      <button
                        onClick={() =>
                          item.Carts.quantity > 1
                            ? updateQuantity(
                                item.Carts.product_id,
                                item.Carts.quantity - 1,
                              )
                            : handleRemoveWithConfirmation(
                                item.Carts.product_id,
                              )
                        }
                        className="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-gray-200 hover:text-gray-900 rounded-l-lg transition-colors cursor-pointer"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-3 w-3"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M20 12H4"
                          />
                        </svg>
                      </button>

                      <span className="text-xs font-bold w-5 text-center text-gray-900">
                        {item.Carts.quantity}
                      </span>

                      <button
                        onClick={() => {
                          if (item.Carts.quantity < item.quantity) {
                            updateQuantity(
                              item.Products.id,
                              item.Carts.quantity + 1,
                            );
                          } else {
                            alert(
                              `Sorry, you've reached the maximum stock available (${item.quantity}).`,
                            );
                          }
                        }}
                        className={`w-7 h-7 flex items-center justify-center rounded-r-lg transition-colors ${
                          item.Carts.quantity >= item.quantity
                            ? "text-gray-300 bg-gray-50 cursor-not-allowed"
                            : "text-gray-600 hover:bg-gray-200 hover:text-gray-900 cursor-pointer"
                        }`}
                        title={
                          item.Carts.quantity >= item.quantity
                            ? "Max stock reached"
                            : "Increase quantity"
                        }
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-3 w-3"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4v16m8-8H4"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="border-t border-gray-100 pt-4">
        <div className="flex justify-between items-center mb-4">
          <span className="text-gray-500 font-semibold">Total</span>
          <span className="text-xl font-black text-gray-900">
            ₱{selectedTotalPrice.toFixed(2)}
          </span>
        </div>

        <button
          onClick={handleCheckout}
          className="cursor-pointer w-full bg-[#0B1527] hover:bg-gray-800 text-white font-bold py-3 px-4 rounded-xl transition-colors flex justify-center items-center gap-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
          disabled={selectedItems.length === 0}
        >
          Checkout Now{" "}
          {selectedItems.length > 0 ? `(${selectedItems.length})` : ""}
        </button>
      </div>
    </div>
  );
}
