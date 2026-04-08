import React from 'react';

export default function Overview() {
  const stats = [
    { title: "Total Revenue", value: "$45,231"},
    { title: "Total Orders", value: "1,203"},
    { title: "Active Customers", value: "8,540"},
    { title: "Unread Alerts", value: "2" }
  ];

  const lowStock = [
    { id: 1, name: 'Almond Biscotti Pack', remaining: 8, status: 'Low Stock' },
    { id: 2, name: 'Vegan Oat & Raisin Bundle', remaining: 3, status: 'Low Stock' },
    { id: 3, name: 'Double Chocolate Chunk', remaining: 0, status: 'Out of Stock' },
  ];

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">{stat.title}</p>
              <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-[#0B1527] mb-6">Low Stock Overview</h3>
          <div className="flex flex-col gap-4">
            {lowStock.map((item) => (
              <div key={item.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <span className="text-sm font-medium text-gray-800 flex-1">{item.name}</span>
                <span className="text-sm text-gray-500 w-24">{item.remaining} remaining</span>
                <span className={`text-xs font-bold px-3 py-1 rounded-md w-24 text-center ${
                  item.status === 'Out of Stock' ? 'bg-red-50 text-red-700' : 'bg-yellow-50 text-yellow-700'
                }`}>
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Analytics Placeholder */}
        <div className="bg-white rounded-3xl p-10 border border-gray-100 shadow-sm flex flex-col items-center justify-center min-h-[300px] text-center">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-4 text-2xl"></div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">Analytics Overview</h3>
          <p className="text-gray-400 text-sm max-w-[250px]">Revenue charts and visitor insights will be visualized here.</p>
        </div>
      </div>
    </div>
  );
}