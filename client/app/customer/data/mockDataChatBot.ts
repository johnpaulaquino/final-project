export interface ChatMessage {
  id: string;
  text: string;
  sender: 'bot' | 'user';
  timestamp: string;
}

export interface QuickAction {
  id: string;
  label: string;
}


export const initialChatMessages: ChatMessage[] = [
  {
    id: '1',
    text: 'Hi there! Welcome to Biskota. How can I sweeten your day?',
    sender: 'bot',
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
  }
];

export const chatQuickActions: QuickAction[] = [
  { id: 'menu', label: 'View Menu' },
  { id: 'track', label: 'Track Order' },
  { id: 'dietary', label: 'Dietary Info' }
];