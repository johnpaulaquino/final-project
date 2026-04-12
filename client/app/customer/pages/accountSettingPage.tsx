"use client";

import { useState } from "react";
import AccountSidebar from "../components/account/accountSidebar";
import AddressBook from "../components/account/addressBook";
import SecuritySettings from "../components/account/security";
import ProfileInfo from "../components/account/profileInfo";

export default function AccountSetting() {
  const [activeAccountTab, setActiveAccountTab] = useState("Profile Info");

  const renderSection = () => {
    switch (activeAccountTab) {
      case "Profile Info":
        return <ProfileInfo />;
      case "Address Book":
        return <AddressBook />;
      case "Security":
        return <SecuritySettings />;
      default:
        return <ProfileInfo />;
    }
  };

  return (
    <main className="max-w-[1500px] mx-auto pt-6 md:pt-28 px-4 md:px-6 flex flex-col xl:flex-row gap-6 md:gap-8 pb-12">
      {/* left column*/}
      <div className="w-full xl:w-[320px] flex-shrink-0 flex flex-col gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight mb-2">
            Account Settings
          </h1>
          <button
            onClick={() => window.history.back()}
            className="text-gray-500 hover:text-[#800000] transition font-medium"
          >
            &lsaquo; Back to Shopping
          </button>
        </div>

        {/* sidebar */}
        <div className="">
          <AccountSidebar
            activeTab={activeAccountTab}
            setActiveTab={setActiveAccountTab}
          />
        </div>
      </div>

      {/* right content */}
      <div className="flex-grow flex flex-col">
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 min-h-[500px]">
          {renderSection()}
        </div>
      </div>
    </main>
  );
}
