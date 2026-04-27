import React from "react";

interface PaginationProps {
  currentPage: number;
  totalRecords: number;
  hasNext: boolean;
  isLoading?: boolean;
  onPageChange: (newPage: number) => void;
}

export default function Pagination({
  currentPage,
  totalRecords,
  hasNext,
  isLoading = false,
  onPageChange,
}: PaginationProps) {
  return (
    <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-100">
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1 || isLoading}
        className="px-5 py-2 text-sm font-semibold border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors active:scale-95"
      >
        Previous
      </button>

      <span className="text-sm font-medium text-gray-500">
        Page {currentPage} <span className="mx-2">•</span> {totalRecords} Total
      </span>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={!hasNext || isLoading}
        className="px-5 py-2 text-sm font-semibold border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors active:scale-95"
      >
        Next
      </button>
    </div>
  );
}
