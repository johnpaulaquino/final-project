"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import HeaderNavbar from "@/app/components/headNavbar";
import MenuPage from "@/app/menu/page/menu";

export const dynamic = "force-dynamic";

function PageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const activeTab = searchParams.get("tab") || "Menu";

  const setActiveTab = (tabName: string) => {
    router.push(`${pathname}?tab=${tabName}`);
  };

  return (
    <div className="min-h-screen bg-white">
      <HeaderNavbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="min-h-screen bg-[#F4F4F5] relative pb-20">
        {activeTab === "Menu" && <MenuPage activeTab={activeTab} setActiveTab={setActiveTab} />}
      </div>
    </div>
  );
}

// 🚀 FIXED: Added the default export and Suspense wrapper!
export default function MenuRoute() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <PageContent />
    </Suspense>
  );
}