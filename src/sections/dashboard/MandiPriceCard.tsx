import { TrendingUp, TrendingDown, Wheat, Sprout } from 'lucide-react';

const mandiPrices = [
  { crop: 'Wheat', icon: 'Wheat', price: '₹2,275', unit: '/qtl', change: '+₹45', up: true, market: 'Patna Mandi' },
  { crop: 'Rice (Paddy)', icon: 'Sprout', price: '₹2,183', unit: '/qtl', change: '-₹18', up: false, market: 'Muzaffarpur' },
  { crop: 'Maize', icon: 'Sprout', price: '₹1,962', unit: '/qtl', change: '+₹32', up: true, market: 'Gaya Mandi' },
  { crop: 'Mustard', icon: 'Sprout', price: '₹5,450', unit: '/qtl', change: '+₹120', up: true, market: 'Patna Mandi' },
];

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = { Wheat, Sprout };

export function MandiPriceCard() {
  return (
    <div className="bg-white dark:bg-white/5 rounded-card shadow-card border border-transparent dark:border-white/5 p-5">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-semibold text-text-primary dark:text-white">Today&apos;s Mandi Prices</h3>
        <span className="text-[11px] text-text-muted uppercase tracking-wider">Live • data.gov.in</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {mandiPrices.map((item) => {
          const Icon = iconMap[item.icon] || Sprout;
          return (
            <div key={item.crop} className="flex items-center gap-3 p-3 rounded-xl bg-light-gray/50 dark:bg-white/5 border border-transparent dark:border-white/5">
              <div className="w-10 h-10 rounded-xl bg-lime-green/10 flex items-center justify-center">
                <Icon className="w-5 h-5 text-lime-green" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-text-primary dark:text-white truncate">{item.crop}</p>
                <p className="text-[11px] text-text-muted truncate">{item.market}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-text-primary dark:text-white">{item.price}<span className="text-[10px] text-text-muted font-normal">{item.unit}</span></p>
                <div className={`flex items-center gap-0.5 justify-end ${item.up ? 'text-lime-green' : 'text-danger-red'}`}>
                  {item.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  <span className="text-[11px] font-medium">{item.change}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
