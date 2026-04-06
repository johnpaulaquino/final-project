'use client';

import Image from 'next/image';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  isRead: boolean;
}

interface NotificationDropdownProps {
  notifications: NotificationItem[];
  onClose: () => void;
  onMarkAllRead: () => void;
  onDelete: (id: string) => void;
  onClearHistory: () => void;
}

export default function NotificationDropdown({ 
  notifications, 
  onClose, 
  onMarkAllRead, 
  onDelete, 
  onClearHistory 
}: NotificationDropdownProps) {

  return (
    <div 
      className="absolute top-full right-0 mt-4 w-[340px] bg-white rounded-[16px] shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100 z-50 overflow-hidden cursor-default flex flex-col" 
      onClick={(e) => e.stopPropagation()}
    >
      
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <h3 className="font-bold text-[#1e293b] text-[15px]">Notifications</h3>
        {notifications.length > 0 && (
          <button onClick={onMarkAllRead} className="text-xs font-bold text-[#800000] hover:underline">
            Mark all as read
          </button>
        )}
      </div>

      {/* notifications */}
      <div className="max-h-[350px] overflow-y-auto custom-scrollbar">
        {notifications.length > 0 ? (
          notifications.map((notif, index) => (
            <div 
              key={notif.id} 
              // notification item container count
              className={`group relative px-5 py-3.5 hover:bg-gray-50 transition-colors cursor-pointer flex flex-col gap-1 ${
                index !== notifications.length - 1 ? 'border-b border-gray-50' : ''
              } ${!notif.isRead ? 'bg-[#fffcfc]' : ''}`} 
            >
              
              {/* red dot */}
              <div className="flex justify-between items-center">
                
                {/* red dot for unread notifications */}
                <div className="flex items-center gap-2">
                  {!notif.isRead && (
                    <div className="h-1.5 w-1.5 bg-[#800000] rounded-full shrink-0"></div>
                  )}
                  <h4 className="text-[13px] font-bold text-[#1e293b]">{notif.title}</h4>
                </div>
                
                {/* notification time */}
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] font-medium text-gray-400">{notif.time}</span>
                  
                  <button 
                    onClick={(e) => {
                      e.stopPropagation(); 
                      onDelete(notif.id);
                    }} 
                    className="opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                  >
                    <Image
                      src='/icons/delete.png' 
                      alt='Delete'
                      width={14} 
                      height={14}
                      className='cursor-pointer object-contain rounded-full transition-all duration-200 hover:[filter:invert(13%)_sepia(84%)_saturate(4414%)_hue-rotate(349deg)_brightness(72%)_contrast(111%)]'
                    />
                  </button>
                </div>

              </div>

              {/* description for notification */}
              <p className={`text-[12px] font-medium text-gray-500 leading-snug pr-6 ${!notif.isRead ? 'pl-3.5' : ''}`}>
                {notif.message}
              </p>

            </div>
          )) 
        ) : (
          <div className="px-5 py-8 text-center text-sm text-gray-500 font-medium">
            Your history is clear.
          </div>
        )}
      </div>

      {/* clear history */}
      {notifications.length > 0 && (
        <div className="p-3 border-gray-100 bg-gray-50">
          <a onClick={onClearHistory} 
          className="cursor-pointer w-full py-1 text-xs font-bold text-gray-500 hover:text-[#800000] text-center block rounded-md transition-colors">
            Clear History
          </a>
        </div>
      )}
    </div>
  );
}