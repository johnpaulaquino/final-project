import React from 'react'
import NotificationTabs from '../../components/notificationTabs';
import Notifications from './adminNotificationPage';
import CustomerNotifications from './customerNotificationPage';


interface NotificationLayoutProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function notificationLayout({ activeTab, setActiveTab }: NotificationLayoutProps) {
  
  const renderNotificationContent = () => {
    switch (activeTab) {
      case 'Admin Inbox': return <Notifications />;
      case 'Send to Customer': return <CustomerNotifications />;
      default: return <Notifications />;
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 min-h-[500px]">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-6 border-b border-gray-100 gap-4">
        <h2 className="text-xl font-bold text-[#0B1527]">Communication Center</h2>
        <NotificationTabs activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>

      <div className="animate-in fade-in duration-300">
        {renderNotificationContent()}
      </div>

    </div>
  );
}