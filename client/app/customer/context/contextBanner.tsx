"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { apiClient } from "@/lib/api";

export interface Banner {
  id: string | number;
  image: string;
}

interface BannerContextType {
  banners: Banner[];
  isLoading: boolean;
  addBanner: (fileBlob: Blob, fileName: string, previewBase64: string) => Promise<void>;
  removeBanner: (id: string | number) => Promise<void>;
  fetchLiveBanners: () => Promise<void>; // 🚀 Added to exports
}

const BannerContext = createContext<BannerContextType | undefined>(undefined);

export function BannerProvider({ children }: { children: React.ReactNode }) {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLiveBanners = useCallback(async () => {
    try {
      setIsLoading(true);
      // Note: skip=1 skips the very first item in the database. 
      // If you are missing your first banner, change this to skip=0!
      const response = await apiClient.get("/products/carousel?skip=1&limit=100");

      const rawData = response?.data?.data || response?.data || response?.items || [];

      const formattedBanners = rawData
        .filter((item: any) => item.CarouselEntity?.image?.image_url)
        .map((item: any) => ({
          id: item.CarouselEntity.id,
          image: item.CarouselEntity.image.image_url,
        }));

      setBanners(formattedBanners);
    } catch (error) {
      console.error("Failed to fetch banners in context:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLiveBanners();
  }, [fetchLiveBanners]);

  const addBanner = async (fileBlob: Blob, fileName: string, previewBase64: string) => {
    try {
      const formData = new FormData();
      formData.append("image", fileBlob, fileName);

      const response = await apiClient.post("/products/carousel", formData);

      const newBanner = {
        id: response?.data?.id || Date.now().toString(),
        image: previewBase64,
      };

      setBanners((prev) => [...prev, newBanner]);
    } catch (error) {
      console.error("Failed to upload banner in context:", error);
      throw error;
    }
  };

  const removeBanner = async (id: string | number) => {
    try {
      await apiClient.delete(`/products/carousel/${id}`);
      setBanners((prev) => prev.filter((banner) => banner.id !== id));
    } catch (error) {
      console.error("Failed to delete banner in context:", error);
      throw error;
    }
  };

  return (
    <BannerContext.Provider
      value={{ banners, isLoading, addBanner, removeBanner, fetchLiveBanners }}
    >
      {children}
    </BannerContext.Provider>
  );
}

export function useBanner() {
  const context = useContext(BannerContext);
  if (context === undefined) {
    throw new Error("useBanner must be used within a BannerProvider");
  }
  return context;
}