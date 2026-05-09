"use client";

import { apiClient } from "@/lib/api";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation"; 

// Dropdowns
import NotificationDropdown from "./dropdown/notificationDropDown";
import CartDropdown from "./dropdown/cartDropDown";
import ProfileDropDown from "./dropdown/profileDropDown";

import ConfirmationModal from "./ConfirmationModal";

// Contexts
import { useCart } from "../context/contextCart";
import { useNotification } from "../context/contextNotification";

interface HeadNavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function HeadNavbar({
  activeTab,
  setActiveTab,
}: HeadNavbarProps) {
  const router = useRouter();

  const navTabs = ["Home", "Menu", "Deals"];

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileProfileExpanded, setIsMobileProfileExpanded] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const cartRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const hamburgerRef = useRef<HTMLButtonElement>(null); // FIXED: Added hamburger ref

  const { totalItems, fetchCarts } = useCart();
  const { notifications } = useNotification(); 

  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const unreadCount = notifications.filter((n) => !n.is_user_read).length;

  useEffect(() => {
    fetchCarts(1, 10);
  }, [fetchCarts]);

  // Close dropdowns when tab changes
  useEffect(() => {
    setIsCartOpen(false);
    setIsNotifOpen(false);
    setIsProfileOpen(false);
    setIsMobileMenuOpen(false);
    setIsMobileProfileExpanded(false); 
  }, [activeTab]);

  // Handle outside clicks
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (dropdownRef.current && !dropdownRef.current.contains(target)) setIsNotifOpen(false);
      if (cartRef.current && !cartRef.current.contains(target)) setIsCartOpen(false);
      if (profileRef.current && !profileRef.current.contains(target)) setIsProfileOpen(false);
      
      // FIXED: Now checks if the click was outside BOTH the menu and the hamburger button
      if (
        mobileMenuRef.current && !mobileMenuRef.current.contains(target) &&
        hamburgerRef.current && !hamburgerRef.current.contains(target)
      ) {
        setIsMobileMenuOpen(false);
        setIsMobileProfileExpanded(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleProfileNavigation = (path: string) => {
    setIsMobileMenuOpen(false);
    setIsMobileProfileExpanded(false);
    router.push(path);
  };

  const handleConfirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      await apiClient.logout();
      // Add redirect logic here if your apiClient doesn't handle it
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setIsLoggingOut(false);
      setIsLogoutModalOpen(false);
    }
  };

  return (
    <nav className='fixed top-0 left-0 z-50 w-full shadow-sm bg-white'>
      <div className='flex items-center justify-between px-6 py-4 mx-auto max-w-7xl'>
        
        {/* Left Section: Mobile Hamburger & Logo */}
        <div className="flex items-center gap-3 lg:gap-6">
          <button
            ref={hamburgerRef} // FIXED: Attached the ref here
            onClick={() => {
              setIsMobileMenuOpen(!isMobileMenuOpen);
              setIsMobileProfileExpanded(false); 
              setIsCartOpen(false);
              setIsNotifOpen(false);
              setIsProfileOpen(false);
            }}
            className="lg:hidden flex flex-col justify-center items-center w-8 h-8 space-y-1.5 focus:outline-none z-50"
            aria-label="Toggle mobile menu"
          >
            <span className={`block w-6 h-0.5 bg-gray-700 transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`block w-6 h-0.5 bg-gray-700 transition-opacity duration-300 ease-in-out ${isMobileMenuOpen ? 'opacity-0' : 'opacity-100'}`} />
            <span className={`block w-6 h-0.5 bg-gray-700 transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
          </button>

          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 z-50">
            <Image
              src="/logo.jpg"
              alt="Biskota Logo"
              width={40}
              height={40}
              className="object-contain rounded-full"
            />
            <span className="text-[#800000] font-bold text-lg sm:text-xl tracking-tight hidden min-[400px]:block">
              Biskota
            </span>
          </div>

          <div className="relative hidden lg:flex items-center p-1 rounded-full border border-gray-100 bg-[#fcfcfc]">
            <div
              className={`absolute left-1 top-1 bottom-1 w-24 bg-white border border-gray-100 shadow-sm rounded-full transition-transform duration-300 ease-in-out ${
                activeTab === "Home" ? "translate-x-0" : activeTab === "Menu" ? "translate-x-full" : "translate-x-[200%]"
              }`}
            />
            {navTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`cursor-pointer relative z-10 w-24 py-2 rounded-full text-sm font-medium transition-colors duration-300 ${
                  activeTab === tab ? "text-[#800000]" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Right Section: Search & Icons */}
        <div className="flex items-center gap-4 sm:gap-6">
          <div className="relative hidden lg:block w-[240px] xl:w-[380px]">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
              <Image src="/icons/search.png" alt="Search Icon" width={17} height={17} className="object-contain" />
            </div>
            <input
              type="text"
              placeholder="Search cravings..."
              className="w-full pl-10 pr-4 py-2.5 bg-[#f6f7f9] border-none rounded-full text-sm focus:outline-none focus:ring-1 focus:ring-[#800000] text-gray-700 placeholder-gray-400 transition"
            />
          </div>

          <div className="hidden lg:block h-7 w-px bg-gray-200"></div>

          <div className="flex items-center gap-3 sm:gap-5 flex-shrink-0">
            {/* Notification Icon */}
            <div className="relative flex items-center" ref={dropdownRef}>
              <button
                className={`cursor-pointer relative hover:opacity-75 transition w-8 h-8 flex items-center justify-center rounded-full ${isNotifOpen ? "bg-[#fff5f5]" : ""}`}
                onClick={() => {
                  setIsNotifOpen(!isNotifOpen);
                  setIsCartOpen(false);
                  setIsProfileOpen(false);
                  setIsMobileMenuOpen(false);
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="#9e9e9e" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 21H10M18 8C18 6.4087 17.3679 4.88258 16.2427 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.8826 2.63214 7.75738 3.75736C6.63216 4.88258 6.00002 6.4087 6.00002 8C6.00002 11.0902 5.22049 13.206 4.34968 14.6054C3.61515 15.7859 3.24788 16.3761 3.26134 16.5408C3.27626 16.7231 3.31488 16.7926 3.46179 16.9016C3.59448 17 4.19261 17 5.38887 17H18.6112C19.8074 17 20.4056 17 20.5382 16.9016C20.6852 16.7926 20.7238 16.7231 20.7387 16.5408C20.7522 16.3761 20.3849 15.7859 19.6504 14.6054C18.7795 13.206 18 11.0902 18 8Z" />
                </svg>
                {unreadCount > 0 && (
                  <div className="absolute top-[1px] right-[-3px] flex h-4.5 w-4.5 items-center justify-center px-[4px] bg-[#800000] rounded-full border-[2px] border-white text-[10px] font-bold text-white leading-none">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </div>
                )}
              </button>
              {isNotifOpen && <NotificationDropdown onClose={() => setIsNotifOpen(false)} />}
            </div>

            {/* Cart Icon */}
            <div className="relative flex items-center" ref={cartRef}>
              <button
                className={`cursor-pointer relative hover:opacity-75 transition w-8 h-8 flex items-center justify-center rounded-full ${isCartOpen ? "bg-[#fff5f5]" : ""}`}
                onClick={() => {
                  setIsCartOpen(!isCartOpen);
                  setIsNotifOpen(false);
                  setIsProfileOpen(false);
                  setIsMobileMenuOpen(false);
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#9e9e9e" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
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

            {/* Desktop Profile Icon */}
            <div className="relative hidden lg:flex items-center" ref={profileRef}>
              <button
                className={`relative hover:opacity-75 transition w-8 h-8 flex items-center justify-center rounded-full ${isProfileOpen ? "bg-[#fff5f5]" : ""}`}
                onClick={() => {
                  setIsProfileOpen(!isProfileOpen);
                  setIsNotifOpen(false);
                  setIsCartOpen(false);
                }}
              >
                <Image src="/icons/profile.png" alt="Profile" width={18} height={18} className="cursor-pointer object-contain rounded-full grayscale transition duration-200 group-hover:brightness-150 group-hover:invert" />
              </button>
              {isProfileOpen && <ProfileDropDown setActiveTab={setActiveTab} />}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Dropdown (< lg) */}
      <div 
        ref={mobileMenuRef}
        className={`lg:hidden absolute top-full left-0 w-full bg-white border-b border-gray-100 shadow-xl flex flex-col overflow-hidden transition-all duration-300 ease-in-out ${
          isMobileMenuOpen ? 'max-h-[600px] opacity-100 visible' : 'max-h-0 opacity-0 invisible'
        }`}
      >
        <div className="px-6 py-4 flex flex-col gap-4">
          
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
              <Image src="/icons/search.png" alt="Search Icon" width={17} height={17} className="object-contain" />
            </div>
            <input
              type="text"
              placeholder="Search cravings..."
              className="w-full pl-10 pr-4 py-3 bg-[#f6f7f9] border-none rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#800000] text-gray-700 placeholder-gray-400 transition"
            />
          </div>

          <div className="h-px w-full bg-gray-100 my-2"></div>

          <div className="flex flex-col gap-2">
            {navTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-colors ${
                  activeTab === tab ? "bg-[#fff5f5] text-[#800000]" : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="h-px w-full bg-gray-100 my-2"></div>

          <div className="flex flex-col">
            <button 
              onClick={() => setIsMobileProfileExpanded(!isMobileProfileExpanded)}
              className="flex items-center justify-between px-4 py-3 w-full text-left rounded-xl text-gray-600 font-medium hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                My Account
              </div>
              
              <svg 
                className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${isMobileProfileExpanded ? 'rotate-180' : ''}`} 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Expandable Nested Menu */}
            <div 
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                isMobileProfileExpanded ? 'max-h-48 opacity-100 mt-1' : 'max-h-0 opacity-0'
              }`}
            >
              <div className="flex flex-col pl-12 pr-4 py-2 gap-3">
                <button 
                  onClick={() => handleProfileNavigation('/customer?tab=Order')}
                  className="cursor-pointer text-left text-sm font-medium text-gray-500 hover:text-[#800000] transition-colors"
                >
                  My Order
                </button>
                
                <button 
                  onClick={() => handleProfileNavigation('/customer?tab=AccountSetting')}
                  className="cursor-pointer text-left text-sm font-medium text-gray-500 hover:text-[#800000] transition-colors"
                >
                  Account Settings
                </button>
                
                <button 
                  onClick={() => setIsLogoutModalOpen(true)}
                  className="cursor-pointer text-left text-sm font-medium text-red-600 hover:text-red-700 transition-colors mt-2"
                >
                  Sign Out
                </button>

                <ConfirmationModal
                  isOpen={isLogoutModalOpen}
                  title="Confirm Logout"
                  message="Are you sure you want to log out of your account?"
                  cancelText="Cancel"
                  confirmText="Yes, Log Out"
                  processingText="Logging out..."
                  isProcessing={isLoggingOut}
                  onCancel={() => setIsLogoutModalOpen(false)}
                  onConfirm={handleConfirmLogout}
                  confirmColorClass="bg-red-600 hover:bg-red-700"
                />
              </div>
            </div>
          </div>

        </div>
      </div>
    </nav>
  );
}