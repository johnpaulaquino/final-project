import { useState, useCallback } from 'react';

export interface RecommendedProduct {
  product_id: string;
  name: string;
  category: string;
  price: number;
  image_url: string;
  score: number;
}

// ── Point this at your FastAPI backend port ───────────────────────────────────
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

export function useRecommendations() {
  const [recommendations, setRecommendations] = useState<RecommendedProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchRecommendations = useCallback(async (
    query: string,
    source: 'chat' | 'search' = 'chat'
  ) => {
    if (!query.trim() || query.trim().length < 2) return;

    setIsLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/v1/recommend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, source, top_n: 4 }),
      });

      if (!res.ok) return;

      const data = await res.json();
      setRecommendations(data.recommendations);
    } catch (err) {
      console.error('Recommendation fetch failed:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearRecommendations = useCallback(() => {
    setRecommendations([]);
  }, []);

  return { recommendations, isLoading, fetchRecommendations, clearRecommendations };
}