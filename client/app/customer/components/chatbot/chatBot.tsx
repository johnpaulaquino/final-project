'use client';
 
import React, { useState, useEffect, useRef } from 'react';
import { chatQuickActions } from '../../data/mockDataChatBot';
 
// ── Types ──────────────────────────────────────────────────────────────────────
interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: string;
}
 
// ── Session ID (persists per browser tab so AI remembers context) ──────────────
const SESSION_ID =
  typeof window !== 'undefined'
    ? (sessionStorage.getItem('biskota_session') ||
       (() => {
         const id = Math.random().toString(36).slice(2);
         sessionStorage.setItem('biskota_session', id);
         return id;
       })())
    : 'ssr';
 
// ── Initial welcome message ────────────────────────────────────────────────────
const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'welcome',
    text: 'Hi there! Welcome to Biskota. How can I sweeten your day?',
    sender: 'bot',
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  },
];
 
// ── Component ──────────────────────────────────────────────────────────────────
export default function ChatBot() {
  const [isOpen, setIsOpen]         = useState(false);
  const [messages, setMessages]     = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading]   = useState(false);
  const [isMounted, setIsMounted]   = useState(false);
  const messagesEndRef               = useRef<HTMLDivElement>(null);
 
  useEffect(() => { setIsMounted(true); }, []);
 
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen, isLoading]);
 
  // ── Send message to Gemini via /api/chat ─────────────────────────────────────
  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;
 
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      text: trimmed,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
 
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);
 
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed, sessionId: SESSION_ID }),
      });
 
      if (!res.ok) throw new Error('API error');
 
      const data = await res.json();
 
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: data.message,
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, botMsg]);
 
    } catch {
      const errMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: "Sorry, I'm having trouble connecting right now. Please try again!",
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
    }
  };
 
  const handleSendMessage = (e?: React.FormEvent) => {
    e?.preventDefault();
    sendMessage(inputValue);
  };
 
  const handleQuickAction = (actionLabel: string) => {
    sendMessage(actionLabel);
  };
 
  return (
    <>
      {/* Floating Button - your original design */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 w-10 h-10 bg-[#800000] rounded-full flex items-center justify-center hover:bg-[#6A0000] hover:scale-105 active:scale-95 shadow-[0_4px_14px_0_rgba(128,0,0,0.39)] transition-all duration-300 z-50 cursor-pointer ${
          isOpen ? 'opacity-0 scale-50 pointer-events-none' : 'opacity-100 scale-100 pointer-events-auto'
        }`}
        aria-label="Open chat"
      >
        <span className="text-white font-serif italic font-bold text-2xl"></span>
      </button>
 
      {/* Chat Panel - your original design */}
      <div
        className={`fixed bottom-6 right-6 w-[320px] bg-white rounded-2xl shadow-[0_5px_40px_-15px_rgba(0,0,0,0.3)] border border-gray-100/50 flex flex-col overflow-hidden z-50 font-sans transition-all duration-300 origin-bottom-right ${
          isOpen ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto' : 'opacity-0 scale-95 translate-y-4 pointer-events-none'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3.5 bg-white border-b border-gray-100 z-10">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div className="w-9 h-9 bg-gradient-to-br from-[#800000] to-[#5a0000] rounded-full flex items-center justify-center text-white shadow-sm font-serif italic font-bold text-base">
              </div>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-[13px] leading-tight">Biskota Assistant</h3>
              <p className="text-[10px] text-green-500 font-medium">
                {isLoading ? 'Typing...' : 'Online'}
              </p>
            </div>
          </div>
 
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full p-1.5 transition-colors cursor-pointer"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
 
        {/* Chat Body */}
        <div className="flex-1 bg-[#F9FAFB] p-3.5 min-h-[260px] max-h-[360px] overflow-y-auto flex flex-col gap-3.5 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
 
          <div className="flex justify-center mt-1 mb-1">
            <span className="text-gray-400 text-[9px] font-semibold tracking-wider uppercase">
              Today
            </span>
          </div>
 
          {messages.map((msg) => (
            <div key={msg.id} className={`flex flex-col mb-1.5 ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
              
              {/* Optional: Show assistant name above its bubbles for a more "human" feel */}
              {msg.sender === 'bot' && (
                <span className="text-[10px] text-gray-500 mb-1 ml-1 font-medium">
                  Biskota Assistant
                </span>
              )}

              {/* The Chat Bubble */}
              <div className={`max-w-[88%] px-4 py-2.5 text-[13px] leading-relaxed shadow-sm whitespace-pre-wrap ${
                msg.sender === 'user'
                  ? 'bg-[#800000] text-white rounded-2xl rounded-tr-sm'
                  : 'bg-white text-gray-800 border border-gray-200 rounded-2xl rounded-tl-sm'
              }`}>
                {msg.text}
              </div>

              {/* Timestamp */}
              <span suppressHydrationWarning className="text-[9px] text-gray-400 mt-1 px-1 font-medium">
                {isMounted ? msg.timestamp : ''}
              </span>
            </div>
          ))}
 
          {/* Typing dots while waiting for AI */}
          {isLoading && (
            <div className="flex flex-col items-start">
              <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-sm px-3.5 py-2.5 shadow-sm flex items-center gap-1">
                {[0, 1, 2].map(i => (
                  <div
                    key={i}
                    className="w-1.5 h-1.5 bg-gray-400 rounded-full"
                    style={{ animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite` }}
                  />
                ))}
              </div>
            </div>
          )}
 
          <style>{`
            @keyframes bounce {
              0%, 80%, 100% { transform: translateY(0); }
              40% { transform: translateY(-5px); }
            }
          `}</style>
 
          <div ref={messagesEndRef} />
        </div>
 
        {/* Quick Actions */}
        <div className="bg-[#F9FAFB] px-3.5 pb-2.5 pt-1 flex flex-wrap gap-1.5">
          {chatQuickActions.map((action) => (
            <button
              key={action.id}
              onClick={() => handleQuickAction(action.label)}
              disabled={isLoading}
              className="px-2.5 py-1 text-[10px] font-semibold text-[#800000] bg-white border border-[#800000]/20 rounded-full hover:bg-[#800000] hover:text-white transition-all duration-200 shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {action.label}
            </button>
          ))}
        </div>
 
        {/* Input Area */}
        <div className="p-2.5 bg-white border-t border-gray-100">
          <form onSubmit={handleSendMessage} className="relative flex items-center">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type your message..."
              disabled={isLoading}
              className="w-full bg-gray-50 border border-gray-200 rounded-full py-2 pl-3.5 pr-10 text-[13px] text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#800000]/20 focus:border-[#800000]/50 transition-all disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isLoading}
              className={`absolute right-1 p-1.5 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer ${
                inputValue.trim() && !isLoading
                  ? 'bg-[#800000] text-white shadow-md transform scale-100'
                  : 'bg-transparent text-gray-300 transform scale-95'
              }`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={inputValue.trim() ? "translate-x-[1px] translate-y-[-1px]" : ""}>
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </form>
 
          <div className="text-center mt-2 flex items-center justify-center">
            <span className="text-[9px] font-medium text-gray-300 flex items-center gap-1">
              Powered by <span className="text-gray-400 font-semibold">Biskota AI</span>
            </span>
          </div>
        </div>
 
      </div>
    </>
  );
}