import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Bot, User, Sparkles, Mic, Camera } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRegion } from '@/contexts/RegionContext';

interface AIChatDrawerProps {
  open: boolean;
  onClose: () => void;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  image?: string;
}

// Context-aware AI response generator
function generateAIResponse(userMsg: string, region: string): string {
  const lower = userMsg.toLowerCase();

  if (lower.includes('pest') || lower.includes('kide') || lower.includes('keeda')) {
    return `🔍 **Pest Analysis for ${region}**\n\nBased on current weather data (humidity >70%, temp 28-32°C), I detect **high risk for stem borer** in rice fields.\n\n**Recommended Action:**\n• Apply Amistar 200ml/acre within 48hrs\n• Focus on fields near water bodies\n• Schedule farmer demo in Village Rampur\n\n**Confidence: 87%** | Based on satellite + weather data`;
  }
  if (lower.includes('weather') || lower.includes('mausam')) {
    return `🌤️ **Weather Forecast — ${region}**\n\n**Today:** 32°C, Partly Cloudy, Humidity 68%\n**Tomorrow:** 30°C, Light Rain Expected\n**Next 3 Days:** Intermittent showers\n\n⚠️ **Advisory:** Reschedule outdoor spraying. Pre-harvest drying may be affected. Recommend covered storage for harvested grain.`;
  }
  if (lower.includes('visit') || lower.includes('plan')) {
    return `📋 **Optimized Visit Plan — Today**\n\n1. **09:00 AM** — Retailer R12, GreenAgro Store (Stock replenishment)\n2. **11:30 AM** — Village Rampur, Farmer Cluster (Pest demo)\n3. **02:00 PM** — Kisan Kendra, Sonepur (New product launch)\n4. **04:30 PM** — Dharnai, Cotton Growers (Follow-up)\n\n**Total Distance:** 28km | **Est. Revenue:** ₹45,000\n\nShall I recalculate based on priority?`;
  }
  if (lower.includes('stock') || lower.includes('inventory')) {
    return `📦 **Inventory Alert — ${region}**\n\n🔴 **Critical:** Score (22 units) — Reorder NOW\n🟡 **Low:** Custodia (34 units), Ridomil (56 units)\n🟢 **Optimal:** Amistar (145), Actara (180)\n\n**Recommendation:** Place emergency order for Score. 3 retailers reporting stockout. Estimated revenue loss: ₹18,000/day.`;
  }
  if (lower.includes('mandi') || lower.includes('price') || lower.includes('bhav')) {
    return `💰 **Today's Mandi Prices**\n\n• Wheat: ₹2,275/qtl (↑₹45)\n• Rice (Paddy): ₹2,183/qtl (↓₹18)\n• Maize: ₹1,962/qtl (↑₹32)\n• Mustard: ₹5,450/qtl (↑₹120)\n\n📈 Wheat prices trending upward for 5 consecutive days. Good time for farmers to sell stored grain.`;
  }
  if (lower.includes('disease') || lower.includes('bimari') || lower.includes('photo') || lower.includes('identify')) {
    return `📸 **Disease Detection Ready**\n\nTo identify a crop disease:\n1. Click the 📷 camera icon below\n2. Upload a close-up photo of the affected leaf/stem\n3. I'll analyze it using computer vision\n\n**Common diseases in ${region} this season:**\n• Rice Blast (Magnaporthe oryzae)\n• Bacterial Leaf Blight\n• Sheath Blight\n\nUpload a photo and I'll provide specific treatment recommendations.`;
  }

  // Default contextual response
  const responses = [
    `Based on current data for **${region}**, I recommend focusing on 3 high-priority villages showing early signs of pest stress. NDVI analysis indicates a 15% drop in crop health index over the past week.\n\nShall I generate a detailed action plan?`,
    `I've analyzed the soil moisture data for **${region}**. 4 out of 12 monitoring stations show below-optimal levels. With the dry spell predicted for next week, I recommend advising farmers on supplementary irrigation.\n\n**Estimated impact:** Prevents 20% yield loss in affected areas.`,
    `Revenue opportunity detected in **${region}**: 5 farmers in Cluster B have crossed the nutrient application window. Recommending Miravis Duo push — estimated Rs. 2.4L opportunity.\n\nWant me to add them to today's visit plan?`,
  ];
  return responses[Math.floor(Math.random() * responses.length)];
}

export function AIChatDrawer({ open, onClose }: AIChatDrawerProps) {
  const { activeRegion } = useRegion();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Namaste! 🌾 I'm your **AgroAI Assistant** for **${activeRegion?.name || 'your territory'}**.\n\nI can help you with:\n• 🐛 Pest & Disease identification\n• 🌤️ Weather insights\n• 📋 Visit planning\n• 📦 Stock management\n• 💰 Mandi prices\n• 📸 Photo-based disease detection\n\nKya jaanna chahte ho?`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (text?: string) => {
    const msg = text || input;
    if (!msg.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: msg,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Smart mock AI response with context
    setTimeout(() => {
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: generateAIResponse(msg, activeRegion?.name || 'Bihar'),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1200 + Math.random() * 800);
  };

  const handleImageUpload = () => {
    // Simulate photo disease detection
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: '📸 [Uploaded leaf photo for analysis]',
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    setTimeout(() => {
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `🔬 **Disease Detection Result**\n\n**Identified:** Rice Blast (Magnaporthe oryzae)\n**Confidence:** 94.2%\n**Severity:** Moderate\n\n**Treatment:**\n1. Apply Tricyclazole 75% WP @ 0.6g/L\n2. Drain excess water from field\n3. Avoid nitrogen top dressing\n4. Re-inspect after 7 days\n\n**Nearest available product:** Custodia at Retailer R08 (34 units in stock)\n\nShall I add this to your visit plan?`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 2000);
  };

  const quickPrompts = [
    '🐛 Pest risk analysis',
    '📋 Plan today\'s visits',
    '🌤️ Weather forecast',
    '📦 Stock alerts',
    '💰 Mandi prices',
    '📸 Identify disease',
  ];

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-50"
            onClick={onClose}
          />

          {/* Chat Panel */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 lg:left-auto lg:right-6 lg:bottom-6 lg:w-[420px] lg:h-[600px] h-[85vh] bg-white dark:bg-[#0D1F0F] rounded-t-2xl lg:rounded-2xl shadow-dropdown z-50 flex flex-col overflow-hidden border border-light-gray dark:border-white/10"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-light-gray dark:border-white/10 bg-gradient-to-r from-deep-green to-lime-green">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">AgroAI Assistant</h3>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-lime-green animate-pulse" />
                    <span className="text-[11px] text-white/80">Online • {activeRegion?.name || 'Bihar'}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    'flex gap-2',
                    msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                  )}
                >
                  <div
                    className={cn(
                      'w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0',
                      msg.role === 'assistant'
                        ? 'gradient-primary'
                        : 'bg-light-gray dark:bg-white/10'
                    )}
                  >
                    {msg.role === 'assistant' ? (
                      <Sparkles className="w-3.5 h-3.5 text-white" />
                    ) : (
                      <User className="w-3.5 h-3.5 text-text-primary dark:text-white" />
                    )}
                  </div>
                  <div
                    className={cn(
                      'max-w-[80%] px-3 py-2 rounded-2xl text-sm leading-relaxed whitespace-pre-line',
                      msg.role === 'assistant'
                        ? 'bg-off-white dark:bg-white/5 text-text-primary dark:text-white rounded-tl-sm'
                        : 'bg-deep-green text-white rounded-tr-sm'
                    )}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex gap-2">
                  <div className="w-7 h-7 rounded-full gradient-primary flex items-center justify-center">
                    <Sparkles className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="bg-off-white dark:bg-white/5 px-4 py-3 rounded-2xl rounded-tl-sm">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 rounded-full bg-text-muted animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 rounded-full bg-text-muted animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 rounded-full bg-text-muted animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompts */}
            {messages.length <= 1 && (
              <div className="px-4 pb-2 flex flex-wrap gap-2">
                {quickPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => handleSend(prompt)}
                    className="px-3 py-1.5 text-xs bg-light-gray dark:bg-white/5 text-text-secondary dark:text-white/70 rounded-full hover:bg-deep-green/10 dark:hover:bg-white/10 transition-colors"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="p-3 border-t border-light-gray dark:border-white/10">
              <div className="flex items-center gap-2 bg-light-gray dark:bg-white/5 rounded-full px-3 py-1">
                <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors flex-shrink-0">
                  <Mic className="w-4 h-4 text-text-muted" />
                </button>
                <button
                  onClick={handleImageUpload}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors flex-shrink-0"
                  title="Upload photo for disease detection"
                >
                  <Camera className="w-4 h-4 text-text-muted" />
                </button>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask AgroAI anything..."
                  className="flex-1 bg-transparent border-none outline-none text-sm text-text-primary dark:text-white placeholder:text-text-muted"
                />
                <button
                  onClick={() => handleSend()}
                  disabled={!input.trim()}
                  className={cn(
                    'w-8 h-8 flex items-center justify-center rounded-full transition-colors flex-shrink-0',
                    input.trim()
                      ? 'gradient-primary text-white'
                      : 'bg-transparent text-text-muted'
                  )}
                >
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
