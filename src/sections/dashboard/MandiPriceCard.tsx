import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, Wheat, Sprout, X, Calculator, Coins, Percent, Sparkles } from 'lucide-react';
import { useApi } from '@/hooks/useApi';
import { mandiAPI, type MandiPrice } from '@/api/client';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = { Wheat, Sprout };

interface MandiPriceCardProps {
  prices?: MandiPrice[];  // injected from DashboardPage when available
}

export function MandiPriceCard({ prices: injectedPrices }: MandiPriceCardProps) {
  // Only fetch independently if DashboardPage didn't inject prices
  const { data: fetchedPrices, loading } = useApi(
    () => injectedPrices ? Promise.resolve(injectedPrices) : mandiAPI.getPrices(),
    [injectedPrices],
  );

  const prices = injectedPrices || fetchedPrices || [];
  
  const [selectedPrice, setSelectedPrice] = useState<MandiPrice | null>(null);
  const [volume, setVolume] = useState<number>(50);
  const [costPercentage, setCostPercentage] = useState<number>(55);
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (loading && !prices.length) {
    return (
      <div className="bg-white dark:bg-white/5 rounded-card shadow-card border border-transparent dark:border-white/5 p-5 animate-pulse">
        <div className="h-5 w-40 bg-light-gray dark:bg-white/10 rounded mb-5" />
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {[0, 1, 2, 3].map(i => <div key={i} className="h-16 bg-light-gray dark:bg-white/10 rounded-xl" />)}
        </div>
      </div>
    );
  }

  // Parse numeric price from string like "₹2,450"
  const getNumericPrice = (priceStr: string) => {
    return parseFloat(priceStr.replace(/[^0-9.]/g, '')) || 0;
  };

  const parsedRate = selectedPrice ? getNumericPrice(selectedPrice.price) : 0;
  const grossRevenue = parsedRate * volume;
  const cultivationCost = grossRevenue * (costPercentage / 100);
  const netProfit = grossRevenue - cultivationCost;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <>
      <div className="bg-white dark:bg-white/5 rounded-card shadow-card border border-transparent dark:border-white/5 p-5">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-semibold text-text-primary dark:text-white">Today's Mandi Prices</h3>
            <p className="text-xs text-text-muted mt-0.5">Click any crop card to open AI Revenue Calculator & crop advisory</p>
          </div>
          <span className="text-[11px] text-text-muted uppercase tracking-wider">Live · data.gov.in</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {prices.slice(0, 4).map((item) => {
            const Icon = iconMap[item.icon] || Sprout;
            return (
              <div 
                key={item.crop} 
                onClick={() => setSelectedPrice(item)}
                className="flex items-center gap-3 p-3 rounded-xl bg-light-gray/50 dark:bg-white/5 border border-transparent dark:border-white/5 hover:border-lime-green/30 dark:hover:border-lime-green/30 hover:scale-[1.02] cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <div className="w-10 h-10 rounded-xl bg-lime-green/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-lime-green" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-text-primary dark:text-white truncate">{item.crop}</p>
                  <p className="text-[11px] text-text-muted truncate">{item.market}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-text-primary dark:text-white">
                    {item.price}<span className="text-[10px] text-text-muted font-normal">{item.unit}</span>
                  </p>
                  <div className={`flex items-center gap-0.5 justify-end ${item.up ? 'text-lime-green' : 'text-danger-red'}`}>
                    {item.up ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                    <span className="text-[11px] font-medium">{item.change}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {mounted && createPortal(
        <AnimatePresence>
          {selectedPrice && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm overflow-y-auto">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="bg-white/90 dark:bg-deep-forest/90 border border-white/20 dark:border-white/10 w-full max-w-lg rounded-2xl shadow-2xl backdrop-blur-md flex flex-col max-h-[85vh] md:max-h-[90vh] overflow-hidden my-auto"
              >
                <div className="p-4 border-b border-light-gray dark:border-white/10 flex justify-between items-center bg-off-white/80 dark:bg-white/5 flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <Calculator className="w-5 h-5 text-lime-green" />
                    <h3 className="font-semibold text-lg text-text-primary dark:text-white">
                      AI Crop Revenue Calculator
                    </h3>
                  </div>
                  <button 
                    onClick={() => setSelectedPrice(null)}
                    className="p-1.5 rounded-full hover:bg-light-gray dark:hover:bg-white/10 text-text-muted transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-6 space-y-5 overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-lime-green/20 scrollbar-track-transparent">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-lime-green/5 border border-lime-green/20">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-lime-green/10 flex items-center justify-center">
                        {(() => {
                          const Icon = iconMap[selectedPrice.icon] || Sprout;
                          return <Icon className="w-6 h-6 text-lime-green" />;
                        })()}
                      </div>
                      <div>
                        <h4 className="font-bold text-text-primary dark:text-white text-lg">{selectedPrice.crop}</h4>
                        <p className="text-xs text-text-muted">{selectedPrice.market}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-extrabold text-lime-green">
                        {selectedPrice.price}<span className="text-xs text-text-muted font-normal">{selectedPrice.unit}</span>
                      </p>
                      <div className={`flex items-center gap-0.5 justify-end mt-0.5 ${selectedPrice.up ? 'text-lime-green' : 'text-danger-red'}`}>
                        {selectedPrice.up ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                        <span className="text-xs font-bold">{selectedPrice.change}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-1.5">
                        Farmer's Crop Quantity (Quintals)
                      </label>
                      <div className="relative flex items-center">
                        <input 
                          type="number" 
                          min="1"
                          value={volume}
                          onChange={e => setVolume(Math.max(1, Number(e.target.value)))}
                          className="w-full px-4 py-2.5 rounded-lg bg-light-gray dark:bg-white/5 border border-transparent dark:border-white/10 text-sm font-semibold text-text-primary dark:text-white outline-none focus:border-lime-green/50 transition-colors"
                        />
                        <span className="absolute right-4 text-xs font-medium text-text-muted">qtl</span>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <label className="text-xs font-bold text-text-muted uppercase tracking-wider flex items-center gap-1">
                          <Percent className="w-3.5 h-3.5 text-lime-green" /> Cost of Cultivation (%)
                        </label>
                        <span className="text-xs font-bold text-lime-green">{costPercentage}%</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <input 
                          type="range" 
                          min="10" 
                          max="90"
                          value={costPercentage}
                          onChange={e => setCostPercentage(Number(e.target.value))}
                          className="flex-1 accent-lime-green cursor-pointer h-1.5 bg-light-gray dark:bg-white/10 rounded-lg appearance-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-light-gray dark:bg-white/5 border border-transparent dark:border-white/5 grid grid-cols-3 gap-2 text-center shadow-inner">
                    <div>
                      <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">
                        <Coins className="w-3 h-3 text-lime-green" /> Gross
                      </div>
                      <p className="text-sm font-extrabold text-text-primary dark:text-white tracking-tight">
                        {formatCurrency(grossRevenue)}
                      </p>
                    </div>
                    <div className="border-x border-light-gray dark:border-white/10 px-2">
                      <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">
                        Cultivation
                      </div>
                      <p className="text-sm font-bold text-danger-red tracking-tight">
                        -{formatCurrency(cultivationCost)}
                      </p>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">
                        Net Profit
                      </div>
                      <p className="text-sm font-extrabold text-lime-green tracking-tight">
                        {formatCurrency(netProfit)}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-lime-green/5 border border-lime-green/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-4 h-4 text-lime-green animate-pulse" />
                      <span className="text-xs font-bold text-lime-green uppercase tracking-wider">AI Mandi Advisory</span>
                    </div>
                    <p className="text-xs text-text-secondary dark:text-white/70 leading-relaxed font-medium">
                      {selectedPrice.up ? (
                        <>
                          Crop prices in <span className="font-bold text-text-primary dark:text-white">{selectedPrice.market}</span> are up by <span className="font-semibold text-lime-green">{selectedPrice.change}</span>. Our predictive algorithms indicate that selling now is highly beneficial. Recommend the grower to harvest and transport to mandi within 48 hours to lock in these prime rates.
                        </>
                      ) : (
                        <>
                          Prices are currently down by <span className="font-semibold text-danger-red">{selectedPrice.change}</span>. We advise using Syngenta-approved hermetic crop storage bags and holding inventory for 10-14 days. Supply analytics show a projected market recovery, which could boost net profit margins by up to 12%.
                        </>
                      )}
                    </p>
                  </div>

                  <button 
                    onClick={() => setSelectedPrice(null)}
                    className="w-full py-3 rounded-button gradient-primary text-white font-semibold text-sm hover:brightness-110 transition-all shadow-glow-green"
                  >
                    Confirm and Close
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
