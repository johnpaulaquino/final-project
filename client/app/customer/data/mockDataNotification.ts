import { NotificationItem } from '../components/dropdown/notificationDropDown';

export const initialNotifications: NotificationItem[] = [
  { 
    id: '1', 
    title: 'Order Delivered!', 
    message: 'Enjoy your freshly baked goods.', 
    time: '2 mins ago', 
    isRead: false 
  },
  { 
    id: '2', 
    title: 'Happy Hour Deal', 
    message: '50% off all signature drinks until 4PM.', 
    time: '1 hour ago', 
    isRead: false 
  },
  { 
    id: '3', 
    title: 'Welcome to Biskota', 
    message: 'Start exploring our delicious menu.', 
    time: '1 day ago', 
    isRead: true 
  },
];