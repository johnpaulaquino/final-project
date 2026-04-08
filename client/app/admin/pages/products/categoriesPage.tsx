'use client';

import React, { useState } from 'react';
import { useCategory } from '../../../customer/context/contextCategory'; 

export default function Categories() {
  const { categories, addCategory, deleteCategory } = useCategory();
  const [newCategoryName, setNewCategoryName] = useState('');

  const handleAddClick = () => {
    if (newCategoryName.trim()) {
      addCategory(newCategoryName);
      setNewCategoryName(''); 
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
    
        <div className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-[10px] border border-blue-100">
          <span className="w-2 h-2 rounded-full bg-blue-600"></span>
          <span className="text-blue-700 font-bold text-sm">{categories.length} Categories</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Add Category */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-[10px] border border-gray-100 shadow-sm">
            <h4 className="text-md font-black text-gray-900 mb-4">Create New</h4>
            <div className="flex flex-col gap-3">
              <input 
                type="text" 
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="e.g. Signature Drinks" 
                className="w-full p-3.5 rounded-[10px] border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:border-[#800000] focus:ring-1 focus:ring-[#800000] transition-colors font-medium" 
                onKeyDown={(e) => e.key === 'Enter' && handleAddClick()} 
              />
              <button 
                onClick={handleAddClick}
                disabled={!newCategoryName.trim()}
                className="w-full bg-[#800000] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-[10px] hover:bg-red-900 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                Add Category
              </button>
            </div>
          </div>
        </div>

        {/* List of Category */}
        <div className="lg:col-span-2">
          <div className="bg-white p-6 md:p-8 rounded-[10px] border border-gray-100 shadow-sm min-h-[300px]">
            {categories.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-10">
                <div className="w-16 h-16 bg-gray-50 rounded-[10px] flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002 2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                </div>
                <p className="text-gray-400 font-bold text-center">No categories yet.<br/>Create one to organize your menu!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {categories.map((cat) => (
                  <div key={cat} className="group p-3 border border-gray-100 rounded-[10px] bg-gray-50/50 hover:bg-white hover:border-blue-200 transition-colors flex justify-between items-center">
                    
                    <div className="flex items-center gap-3">
                      {/* Folder Icon */}
                      <span className="font-bold text-sm text-gray-800">{cat}</span>
                    </div>

                    <button 
                      onClick={() => {
                        if(window.confirm(`Delete the "${cat}" category?`)) {
                          deleteCategory(cat);
                        }
                      }}
                      className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white hover:bg-red-500 rounded-[5px] transition-colors cursor-pointer"
                      title="Delete Category"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>

                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}