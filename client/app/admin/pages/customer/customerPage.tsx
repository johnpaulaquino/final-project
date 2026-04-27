"use client";

import React, { useState, useEffect } from "react";
import { apiClient } from "@/lib/api"; // Adjust path if needed
import Pagination from "@/app/Pagination";

// Match your backend JSON structure
interface Customer {
  email: string;
  created_at: string;
  role: string;
  firstname: string | null;
  middle_name: string | null;
  lastname: string | null;
}

interface PaginationMeta {
  has_next: boolean;
  total_records: number;
  start_page: number;
  end_page: number;
}

export default function CustomerList() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10;
  const [pagination, setPagination] = useState<PaginationMeta>({
    has_next: false,
    total_records: 0,
    start_page: 1,
    end_page: 1,
  });

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setIsLoading(true);

        const response = await apiClient.get(
          `/me/all?skip=${currentPage}&limit=${limit}`,
        );

        // Handle pagination metadata from your backend
        setPagination(
          response.paginated || {
            has_next: false,
            total_records: 0,
            start_page: 1,
            end_page: 1,
          },
        );

        // Safely extract the array of customers
        const data = response.data || response.items || response || [];
        setCustomers(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to fetch customers:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCustomers();
  }, [currentPage]);

  // Safely format name or fallback to "Unknown User"
  const getFullName = (first: string | null, last: string | null) => {
    const nameParts = [first, last].filter(Boolean);
    return nameParts.length > 0 ? nameParts.join(" ") : "Unknown User";
  };

  // Format the ISO date to a clean string
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const safeDate =
      dateString.endsWith("Z") || dateString.includes("+")
        ? dateString
        : `${dateString}Z`;
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(safeDate));
  };

  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 min-h-[500px] flex flex-col justify-between animate-in fade-in duration-300">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          Registered Customers
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="py-4 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Customer
                </th>
                <th className="py-4 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Group
                </th>
                <th className="py-4 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Joined Date
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                // Simple Loading State
                <tr>
                  <td
                    colSpan={3}
                    className="py-12 text-center text-sm font-medium text-gray-400 animate-pulse"
                  >
                    Loading customers...
                  </td>
                </tr>
              ) : customers.length > 0 ? (
                // Dynamic Data Mapping
                customers.map((customer, index) => (
                  <tr
                    key={customer.email || index}
                    className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="py-4 px-4">
                      <p className="font-bold text-gray-900">
                        {getFullName(customer.firstname, customer.lastname)}
                      </p>
                      <p className="text-xs text-gray-500">{customer.email}</p>
                    </td>
                    <td className="py-4 px-4">
                      <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-md">
                        {customer.role || "Customer"}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-600">
                      {formatDate(customer.created_at)}
                    </td>
                  </tr>
                ))
              ) : (
                // Empty State
                <tr>
                  <td
                    colSpan={3}
                    className="py-12 text-center text-sm font-medium text-gray-400"
                  >
                    No customers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 🚀 Reusable Pagination Component in Action */}
      <Pagination
        currentPage={currentPage}
        totalRecords={pagination.total_records}
        hasNext={pagination.has_next}
        isLoading={isLoading}
        onPageChange={(newPage: number) => setCurrentPage(newPage)}
      />
    </div>
  );
}
