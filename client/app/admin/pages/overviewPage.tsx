import React, { useState, useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';

// Custom Tooltip Component
const MLTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-100 text-sm">
        <p className="font-bold text-gray-800 mb-2">{label} 2026</p>
        <p className="text-gray-600 flex justify-between gap-4">
          <span>Actual:</span>
          <span className="font-medium">₱{data.Actual.toLocaleString()}</span>
        </p>
        <p className="text-[#f43f5e] flex justify-between gap-4">
          <span>Predicted:</span>
          <span className="font-bold">₱{data.Predicted.toLocaleString()}</span>
        </p>
        {data.event && (
          <p className="mt-2 pt-2 border-t border-gray-100 text-xs font-semibold" style={{ color: data.eventColor }}>
            ★ {data.event}
          </p>
        )}
      </div>
    );
  }
  return null;
};

export default function Overview() {
  const stats = [
    { title: "Total Revenue", value: "₱45,231"},
    { title: "Total Orders", value: "1,203"},
    { title: "Active Customers", value: "8,540"},
    { title: "Unread Alerts", value: "2" }
  ];

  const [baseDailySales, setBaseDailySales] = useState(5000);
  const [holidayIntensity, setHolidayIntensity] = useState(100);

  // Mapped events to months instead of specific dates
  const monthlyEvents: Record<string, {name: string, mult: number, color: string}> = useMemo(() => ({
    'Feb': { name: "Valentine's Season", mult: 1.8, color: '#ef4444' },
    'Apr': { name: "Holy Week", mult: 1.3, color: '#8b5cf6' },
    'May': { name: "Mother's Day", mult: 2.0, color: '#ec4899' },
    'Oct': { name: "Halloween", mult: 1.5, color: '#f97316' },
    'Dec': { name: "Holiday Season", mult: 2.8, color: '#10b981' }
  }), []);

  const chartData = useMemo(() => {
    const data = [];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    const baseMonthlySales = baseDailySales * 30;
    
    for (let i = 0; i < months.length; i++) {
      const monthName = months[i];
      const event = monthlyEvents[monthName];
      
      let multiplier = 1 + (Math.random() * 0.3 - 0.15); 
      
      if (event) {
        multiplier += (event.mult - 1) * (holidayIntensity / 100);
      }

      const predicted = Math.round(baseMonthlySales * multiplier);
      // Actual fluctuates slightly from predicted
      const actual = Math.round(predicted * (1 + (Math.random() * 0.15 - 0.07)));

      data.push({
        month: monthName,
        Actual: actual,
        Predicted: predicted,
        event: event?.name || null,
        eventColor: event?.color || null
      });
    }
    return data;
  }, [baseDailySales, holidayIntensity, monthlyEvents]);

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300 p-6">
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

      {/* Analytics Chart */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 h-[480px] flex flex-col">
        <h3 className="text-lg font-bold text-[#0B1527] mb-6">Revenue Forecast (Jan - Dec)</h3>
        <div className="w-full flex-grow">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis 
                dataKey="month" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748b', fontSize: 12 }}
                dy={10}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748b', fontSize: 12 }}
                tickFormatter={(val) => `₱${val / 1000}k`}
                dx={-10}
              />
              <Tooltip content={<MLTooltip />} />
              
              <Area 
                type="monotone" 
                dataKey="Actual" 
                stroke="#cbd5e1" 
                strokeWidth={2}
                fill="none" 
                activeDot={false}
              />
              
              <Area 
                type="monotone" 
                dataKey="Predicted" 
                stroke="#f43f5e" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorPredicted)" 
                activeDot={{ r: 6, fill: '#f43f5e', stroke: '#fff', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}