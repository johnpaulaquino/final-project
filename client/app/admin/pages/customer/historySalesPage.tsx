"use client";

import { apiClient } from "@/lib/api";
import { log } from "node:console";
import React, { useState, useEffect } from "react";

interface SaleRecord {
  id: string;
  firstname: string | null;
  middle_name: string | null;
  lastname: string | null;
  total_amount: number;
  transaction_reference: string;
  order_id: number;
  transaction_id: string;
}

interface PaginationMeta {
  has_next: boolean;
  total_records: number;
  start_page: number;
  end_page: number;
}

export default function SalesHistory() {
  const [sales, setSales] = useState<SaleRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationMeta>({
    has_next: false,
    total_records: 0,
    start_page: 1,
    end_page: 1,
  });
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10;

  useEffect(() => {
    const fetchSalesHistory = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await apiClient.get(
          `/order/user-sales?skip=${currentPage}&limit=${limit}`,
        );
        console.log("Paginated", response.paginated);

        setPagination(response.paginated || pagination); // Update pagination state
        setSales(response.data || []);
        console.log("Fetched sales history:", pagination);
      } catch (err: any) {
        console.error("Failed to fetch sales:", err);
        setError("Failed to load sales history.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSalesHistory();
  }, [currentPage]); // Re-fetch whenever currentPage changes

  // Helper to safely format the name and handle missing/null values
  const formatFullName = (
    first?: string | null,
    middle?: string | null,
    last?: string | null,
  ) => {
    const nameParts = [first, middle, last].filter(Boolean);
    return nameParts.length > 0 ? nameParts.join(" ") : "Unknown Client";
  };

  return (
    <div className="bg-white p-6 md:p-8 min-h-[500px] flex flex-col relative animate-in fade-in duration-300">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Sales</h2>

      {error ? (
        <div className="flex-1 flex justify-center items-center text-red-500 font-medium">
          {error}
        </div>
      ) : (
        <>
          <div className="w-full overflow-x-auto rounded-lg border border-gray-100">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100 text-xs font-semibold tracking-wider text-gray-500 uppercase">
                  <th className="py-4 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider rounded-tl-xl">
                    Transaction Ref
                  </th>
                  <th className="py-4 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Fullname
                  </th>
                  <th className="py-4 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider rounded-tr-xl">
                    Total Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  // Loading Skeleton Rows
                  [...Array(5)].map((_, i) => (
                    <tr
                      key={`skeleton-${i}`}
                      className="border-b border-gray-50"
                    >
                      <td className="py-4 px-4">
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-1/3"></div>
                      </td>
                    </tr>
                  ))
                ) : sales.length > 0 ? (
                  sales.map((sale) => (
                    <tr
                      key={sale.transaction_reference}
                      className="border-b border-gray-50 hover:bg-gray-50/80 transition-colors"
                    >
                      <td className="py-4 px-4 text-sm font-medium text-gray-500">
                        {sale.transaction_reference || "N/A"}
                      </td>
                      <td className="py-4 px-4 text-sm font-bold text-gray-900">
                        {formatFullName(
                          sale.firstname,
                          sale.middle_name,
                          sale.lastname,
                        )}
                      </td>
                      <td className="py-4 px-4 text-sm font-bold text-[#800000]">
                        ₱
                        {sale.total_amount?.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }) || "0.00"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={3}
                      className="py-12 text-center text-sm font-medium text-gray-400"
                    >
                      No sales history found for this page.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-100">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1 || isLoading}
              className="px-5 py-2 text-sm font-semibold border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>

            <span className="text-sm font-medium text-gray-500">
              Page {currentPage} <span className="mx-2">•</span>{" "}
              {pagination.total_records} Total
            </span>

            <button
              onClick={() => setCurrentPage((p) => p + 1)}
              disabled={!pagination.has_next || isLoading}
              className="px-5 py-2 text-sm font-semibold border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}
