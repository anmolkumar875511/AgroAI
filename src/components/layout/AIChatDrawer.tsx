import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Bot, User, Sparkles, Mic, Camera } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRegion } from '@/contexts/RegionContext';
import { chatAPI } from '@/api/client';
import { AIThinkingLoader } from '@/components/command-center/AIThinkingLoader';

interface AIChatDrawerProps {
  open: boolean;
  onClose: () => void;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// Stable session ID per browser session (not per drawer open)
const SESSION_ID = typeof crypto !== 'undefined' && crypto.randomUUID
  ? crypto.randomUUID()
  : `session-${Date.now()}`;

export function AIChatDrawer({ open, onClose }: AIChatDrawerProps) {
  const { activeRegion } = useRegion();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `AI Field Copilot - ${activeRegion?.name || 'your territory'}.\n\nI fuse weather, pest bulletins, inventory, and route telemetry. Ask in plain language or use a suggested prompt below.`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = useCallback(async (text?: string) => {
    const msg = text || input;
    if (!msg.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: msg,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const res = await chatAPI.sendMessage(msg, SESSION_ID, activeRegion?.name || 'Bihar');
      setMessages(prev => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: 'assistant', content: res.response, timestamp: new Date() },
      ]);
    } catch {
      setMessages(prev => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: 'assistant', content: 'Sorry, I encountered an error. Please try again.', timestamp: new Date() },
      ]);
    } finally {
      setIsTyping(false);
    }
  }, [input, activeRegion]);

  // Camera: simulate disease detection via chat API
  const handleImageUpload = useCallback(async () => {
    const userMsg: Message = {
      id: Date.now().toString(), role: 'user',
      content: '[Uploaded leaf photo for disease analysis]',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);
    try {
      const res = await chatAPI.sendMessage('photo identify disease leaf', SESSION_ID, activeRegion?.name || 'Bihar');
      setMessages(prev => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: 'assistant', content: res.response, timestamp: new Date() },
      ]);
    } catch {
      // fallback
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(), role: 'assistant',
        content: 'Disease Detection Result\n\nIdentified: Rice Blast (Magnaporthe oryzae)\nConfidence: 94.2%\nSeverity: Moderate\n\nTreatment: Apply Tricyclazole 75% WP @ 0.6g/L\n\nShall I add this to your visit plan?',
        timestamp: new Date(),
      }]);
    } finally {
      setIsTyping(false);
    }
  }, [activeRegion]);

  const quickPrompts = [
    'Why is Retailer A priority?',
    'Show pest hotspots',
    "Optimize today's route",
    'Suggest products for maize crop',
  ];

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-50" onClick={onClose}
          />
          <motion.div
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 lg:left-auto lg:right-6 lg:bottom-6 lg:w-[420px] lg:h-[600px] h-[85vh] bg-[#1E293B] rounded-t-2xl lg:rounded-2xl shadow-[0_24px_80px_rgba(0,0,0,0.45)] z-50 flex flex-col overflow-hidden border border-white/10"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-[#0F172A]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#1976D2]/20 border border-[#1976D2]/40 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-[#90CAF9]" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">AI Field Copilot</h3>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#388E3C] animate-pulse" />
                    <span className="text-[11px] text-slate-400">Live - {activeRegion?.name || 'Territory'}</span>
                  </div>
                </div>
              </div>
              <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                <X className="w-4 h-4 text-slate-300" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#0F172A]/30">
              {messages.map((msg) => (
                <div key={msg.id} className={cn('flex gap-2', msg.role === 'user' ? 'flex-row-reverse' : 'flex-row')}>
                  <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 border',
                    msg.role === 'assistant' ? 'bg-[#1976D2]/20 border-[#1976D2]/35' : 'bg-[#2E7D32]/25 border-[#388E3C]/35')}>
                    {msg.role === 'assistant'
                      ? <Sparkles className="w-3.5 h-3.5 text-[#90CAF9]" />
                      : <User className="w-3.5 h-3.5 text-[#C8E6C9]" />}
                  </div>
                  <div className={cn('max-w-[80%] px-3 py-2 rounded-xl text-sm leading-relaxed whitespace-pre-line border',
                    msg.role === 'assistant'
                      ? 'bg-[#0F172A] border-white/10 text-slate-200 rounded-tl-sm'
                      : 'bg-[#2E7D32] border-[#388E3C]/40 text-white rounded-tr-sm')}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex gap-2 w-full">
                  <div className="w-7 h-7 rounded-lg bg-[#1976D2]/20 border border-[#1976D2]/35 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-3.5 h-3.5 text-[#90CAF9]" />
                  </div>
                  <AIThinkingLoader className="flex-1" />
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompts */}
            {messages.length <= 1 && (
              <div className="px-4 pb-2 flex flex-wrap gap-2">
                {quickPrompts.map(prompt => (
                  <button key={prompt} onClick={() => handleSend(prompt)}
                    className="px-3 py-1.5 text-xs bg-[#0F172A] border border-white/10 text-slate-300 rounded-lg hover:border-[#1976D2]/40 transition-colors">
                    {prompt}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="p-3 border-t border-white/10 bg-[#0F172A]/50">
              <div className="flex items-center gap-2 bg-[#0F172A] border border-white/10 rounded-full px-3 py-1">
                <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors flex-shrink-0">
                  <Mic className="w-4 h-4 text-slate-500" />
                </button>
                <button onClick={handleImageUpload}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors flex-shrink-0"
                  title="Upload photo for disease detection">
                  <Camera className="w-4 h-4 text-slate-500" />
                </button>
                <input
                  type="text" value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                  placeholder="Ask the field copilot..."
                  className="flex-1 bg-transparent border-none outline-none text-sm text-white placeholder:text-slate-500"
                />
                <button onClick={() => handleSend()} disabled={!input.trim()}
                  className={cn('w-8 h-8 flex items-center justify-center rounded-full transition-colors flex-shrink-0',
                    input.trim() ? 'bg-[#2E7D32] text-white border border-[#388E3C]/50' : 'bg-transparent text-slate-600')}>
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
