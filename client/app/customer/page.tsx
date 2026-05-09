"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import HeaderNavbar from "./components/headNavbar";
import Homepage from "./pages/homePage";
import Menu from "./pages/menuPage";
import Deals from "./pages/dealsPage";
import Checkout from "./pages/checkoutPage";
import AccountSetting from "./pages/accountSettingPage";
import Order from "./pages/orderPage";
import Chatbot from "./components/chatbot/chatBot";
export const dynamic = "force-dynamic";

// 1. Rename your main logic to a sub-component
function PageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Read the URL to see what tab we are on (defaults to 'Home')
  const activeTab = searchParams.get("tab") || "Home";

  // Function to change the URL without a full page reload
  const setActiveTab = (tabName: string) => {
    router.push(`${pathname}?tab=${tabName}`);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Pass the state and updater to your Navbar */}
      <HeaderNavbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="min-h-screen bg-[#F4F4F5] relative pb-20">
        {/* Render the correct component based on the URL */}
        {activeTab === "Home" && <Homepage setActiveTab={setActiveTab} />}
        {activeTab === "Menu" && <Menu setActiveTab={setActiveTab} />}
        {activeTab === "Deals" && <Deals />}
        {activeTab === "Checkout" && <Checkout />}
        {activeTab === "AccountSetting" && <AccountSetting />}
        {activeTab === "Order" && <Order />}
        <Chatbot />
      </div>
    </div>
  );
}

// 2. Create a default export that wraps PageContent in Suspense
export default function CustomerPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <PageContent />
    </Suspense>
  );
}

