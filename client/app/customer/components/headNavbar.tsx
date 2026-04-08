"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import NotificationDropdown from "./dropdown/notificationDropDown";
import { initialNotifications } from "../data/mockDataNotification";

import CartDropdown from "./dropdown/cartDropDown";
import { useCart } from "../context/contextCart";

import ProfileDropDown from "./dropdown/profileDropDown";

interface HeadNavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function headNavbar({
  activeTab,
  setActiveTab,
}: HeadNavbarProps) {
  const navTabs = ["Home", "Menu", "Deals"];

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const cartRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const [notifications, setNotifications] = useState(initialNotifications);
  const hasUnread = notifications.some((n) => !n.isRead);

  const { totalItems } = useCart();

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleDeleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
  };

  const handleClearHistory = () => {
    setNotifications([]);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsNotifOpen(false);
      }

      if (cartRef.current && !cartRef.current.contains(event.target as Node)) {
        setIsCartOpen(false);
      }

      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  return (
    <nav className="fixed top-0 left-0 z-50 w-full shadow-sm bg-white flex items-center justify-between gap-2 sm:gap-4 lg:gap-6 px-4 sm:px-6 py-3 sm:py-4 mx-auto">
      <div className="flex items-center gap-6 lg:gap-10">
        {/* logo */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <Image
            src="/logo.jpg"
            alt="Biskota Logo"
            width={40}
            height={40}
            className="object-contain rounded-full"
          />
          <span className="text-[#800000] font-bold text-lg sm:text-xl tracking-tight">
            Biskota
          </span>
        </div>

        {/*buttons*/}
        <div className="relative hidden lg:flex items-center p-1 rounded-full border border-gray-100 bg-[#fcfcfc]">
          {/* slide animation */}
          <div
            className={`absolute left-1 top-1 bottom-1 w-24 bg-white border border-gray-100 shadow-sm rounded-full transition-transform duration-300 ease-in-out ${
              activeTab === "Home"
                ? "translate-x-0"
                : activeTab === "Menu"
                  ? "translate-x-full"
                  : "translate-x-[200%]"
            }`}
          ></div>

          {/* buttons for home, menu and deals */}
          {navTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`cursor-pointer relative z-10 w-24 py-2 rounded-full text-sm font-medium transition-colors duration-300 ${
                activeTab === tab
                  ? "text-[#800000]"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4 sm:gap-6">
        {/* icon search bar */}
        <div className="relative hidden sm:block w-[200px] md:w-[240px] lg:w-[380px]">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
            <Image
              src="/icons/search.png"
              alt="Search Icon"
              width={17}
              height={17}
              className="object-contain rounded-full"
            />
          </div>

          <input
            type="text"
            placeholder="Search cravings..."
            className="w-full pl-10 pr-4 py-2.5 bg-[#f6f7f9] border-none rounded-full text-sm focus:outline-none focus:ring-1 focus:ring-[#800000] text-gray-700 placeholder-gray-400 transition"
          />
        </div>

        {/* divider */}
        <div className="hidden sm:block h-7 w-px bg-gray-200"></div>

        {/* icon notification */}
        <div className="cursor-pointer flex items-center gap-4 lg:gap-6 flex-shrink-0">
          <div className="relative flex items-center" ref={dropdownRef}>
            <button
              className={`relative hover:opacity-75 transition w-8 h-8 flex items-center justify-center rounded-full ${isNotifOpen ? "bg-[#fff5f5]" : ""}`}
              onClick={() => {
                setIsNotifOpen(!isNotifOpen);
                setIsCartOpen(false);
                setIsProfileOpen(false);
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="21"
                height="21"
                fill="none"
                stroke="#9e9e9e"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14 21H10M18 8C18 6.4087 17.3679 4.88258 16.2427 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.8826 2.63214 7.75738 3.75736C6.63216 4.88258 6.00002 6.4087 6.00002 8C6.00002 11.0902 5.22049 13.206 4.34968 14.6054C3.61515 15.7859 3.24788 16.3761 3.26134 16.5408C3.27626 16.7231 3.31488 16.7926 3.46179 16.9016C3.59448 17 4.19261 17 5.38887 17H18.6112C19.8074 17 20.4056 17 20.5382 16.9016C20.6852 16.7926 20.7238 16.7231 20.7387 16.5408C20.7522 16.3761 20.3849 15.7859 19.6504 14.6054C18.7795 13.206 18 11.0902 18 8Z" />
              </svg>

              {hasUnread && (
                <div className="absolute top-[1px] right-[1px] h-3.5 w-3.5 bg-[#800000] rounded-full border-[2px] border-white"></div>
              )}
            </button>

            {/* dropdown */}
            {isNotifOpen && (
              <NotificationDropdown
                notifications={notifications}
                onClose={() => setIsNotifOpen(false)}
                onMarkAllRead={handleMarkAllRead}
                onDelete={handleDeleteNotification}
                onClearHistory={handleClearHistory}
              />
            )}
          </div>

          {/* Cart */}
          <div className="relative flex items-center" ref={cartRef}>
            <button
              className={`relative hover:opacity-75 transition w-8 h-8 flex items-center justify-center rounded-full ${isCartOpen ? "bg-[#fff5f5]" : ""}`}
              onClick={() => {
                setIsCartOpen(!isCartOpen);
                setIsNotifOpen(false);
                setIsProfileOpen(false);
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="24"
                height="24"
                fill="none"
                stroke="#9e9e9e"
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 9L6.5 4h11L20 9" />
                <path d="M4 9v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9" />
                <path d="M4 9h16" />
                <path d="M9.5 13a2.5 2.5 0 0 0 5 0" />
              </svg>

              {totalItems > 0 && (
                <div className="absolute top-[1px] right-[-3px] flex h-4.5 w-4.5 items-center justify-center px-[4px] bg-[#800000] rounded-full border-[2px] border-white text-[10px] font-bold text-white leading-none">
                  {totalItems > 99 ? "99+" : totalItems}
                </div>
              )}
            </button>

            {isCartOpen && <CartDropdown setActiveTab={setActiveTab} />}
          </div>

          {/* icon */}
          <div className="relative flex items-center" ref={profileRef}>
            <button
              className={`relative hover:opacity-75 transition w-8 h-8 flex items-center justify-center rounded-full ${isCartOpen ? "bg-[#fff5f5]" : ""}`}
              onClick={() => {
                setIsProfileOpen(!isProfileOpen);
                setIsNotifOpen(false);
                setIsCartOpen(false);
              }}
            >
              <Image
                src="/icons/profile.png"
                alt="Profile"
                width={18}
                height={18}
                className="cursor-pointer object-contain rounded-full grayscale transition duration-200 group-hover:brightness-150 group-hover:invert"
              />
            </button>
            {isProfileOpen && <ProfileDropDown setActiveTab={setActiveTab} />}
          </div>
        </div>
      </div>
    </nav>
  );
}
