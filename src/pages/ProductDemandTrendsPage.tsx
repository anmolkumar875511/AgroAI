import { useState } from 'react';
import { Leaf, Search, Filter, ArrowUpRight, ArrowDownRight, PackageOpen, Sparkles, ShoppingBag } from 'lucide-react';
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis,
  Tooltip, CartesianGrid, Legend
} from 'recharts';
import { toast } from 'sonner';

const MONTHLY_DEMAND = [
  { month: 'Jan', 'Amistar 250 SC': 1200, 'Actara 25 WG': 900, 'Tilt 250 EC': 800, 'Movondo': 500, 'Score 250 EC': 700, 'Vibrance': 400 },
  { month: 'Feb', 'Amistar 250 SC': 1400, 'Actara 25 WG': 1100, 'Tilt 250 EC': 850, 'Movondo': 480, 'Score 250 EC': 750, 'Vibrance': 450 },
  { month: 'Mar', 'Amistar 250 SC': 1800, 'Actara 25 WG': 1400, 'Tilt 250 EC': 1100, 'Movondo': 600, 'Score 250 EC': 900, 'Vibrance': 500 },
  { month: 'Apr', 'Amistar 250 SC': 2100, 'Actara 25 WG': 1600, 'Tilt 250 EC': 1300, 'Movondo': 750, 'Score 250 EC': 1050, 'Vibrance': 600 },
  { month: 'May', 'Amistar 250 SC': 2400, 'Actara 25 WG': 1850, 'Tilt 250 EC': 1500, 'Movondo': 920, 'Score 250 EC': 1150, 'Vibrance': 700 },
  { month: 'Jun', 'Amistar 250 SC': 2450, 'Actara 25 WG': 1890, 'Tilt 250 EC': 1650, 'Movondo': 980, 'Score 250 EC': 1200, 'Vibrance': 750 },
];

const PRODUCT_PERFORMANCE = [
  { id: 1, name: 'Amistar 250 SC', category: 'Fungicide', sold: '2,450', revenue: '₹12.5L', growth: '+18%', isPositive: true, stockStatus: 'Good Stock', demandScore: 92, stock: 450, req: 380 },
  { id: 2, name: 'Actara 25 WG', category: 'Insecticide', sold: '1,890', revenue: '₹9.8L', growth: '+34%', isPositive: true, stockStatus: 'Good Stock', demandScore: 88, stock: 380, req: 320 },
  { id: 3, name: 'Tilt 250 EC', category: 'Fungicide', sold: '1,650', revenue: '₹8.2L', growth: '+12%', isPositive: true, stockStatus: 'Medium Stock', demandScore: 78, stock: 250, req: 280 },
  { id: 4, name: 'Movondo', category: 'Fungicide', sold: '980', revenue: '₹5.1L', growth: '-5%', isPositive: false, stockStatus: 'Low Stock', demandScore: 65, stock: 120, req: 220 },
  { id: 5, name: 'Score 250 EC', category: 'Fungicide', sold: '1,200', revenue: '₹6.3L', growth: '+8%', isPositive: true, stockStatus: 'Good Stock', demandScore: 72, stock: 290, req: 240 },
  { id: 6, name: 'Vibrance Integral', category: 'Seed Treatment', sold: '750', revenue: '₹4.8L', growth: '+22%', isPositive: true, stockStatus: 'Good Stock', demandScore: 70, stock: 200, req: 160 },
];

const TERRITORY_DEMAND = [
  { territory: 'Bihar', 'Units Sold': 3500, color: '#8BC34A' },
  { territory: 'Maharashtra', 'Units Sold': 2800, color: '#1E88E5' },
  { territory: 'Punjab', 'Units Sold': 2400, color: '#FFC107' },
  { territory: 'Uttar Pradesh', 'Units Sold': 1900, color: '#E53935' },
  { territory: 'Gujarat', 'Units Sold': 1500, color: '#9C27B0' },
];

export default function ProductDemandTrendsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [timeRange, setTimeRange] = useState('6m');

  const filteredProducts = PRODUCT_PERFORMANCE.filter(prod => {
    const matchesSearch = prod.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prod.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || prod.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const getStockBadge = (status: string) => {
    switch (status) {
      case 'Good Stock': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25';
      case 'Medium Stock': return 'bg-amber-500/10 text-amber-400 border-amber-500/25';
      default: return 'bg-rose-500/10 text-rose-400 border-rose-500/25 animate-pulse';
    }
  };

  const handleRestockOrder = (product: string) => {
    toast.success(`Automated restock requisition triggered for ${product}!`);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Title */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-text-primary dark:text-white tracking-tight">
          Product Demand Trends
        </h1>
        <p className="text-text-secondary dark:text-white/60 text-sm mt-1">
          Track high-performing crop protection chemicals, seed treatments, and forecast supply requirements.
        </p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Products Tracked', value: '6', icon: Leaf, desc: 'Active catalog listings', color: 'text-emerald-400 border-emerald-500/20' },
          { label: 'Top Selling Brand', value: 'Amistar 250 SC', icon: ShoppingBag, desc: '₹12.5L Revenue generated (30d)', color: 'text-lime-green border-lime-green/20' },
          { label: 'Highest Demand Growth', value: 'Actara (+34%)', icon: Sparkles, desc: 'Driven by cotton crop season', color: 'text-blue-400 border-blue-400/20' },
          { label: 'Stock Alert Outlets', value: 'Movondo (Low)', icon: PackageOpen, desc: 'Immediate stock dispatch needed', color: 'text-rose-400 border-rose-500/20' },
        ].map((card, i) => (
          <div key={i} className="backdrop-blur-md bg-white/70 dark:bg-[#122315]/30 border border-white/20 dark:border-white/10 rounded-card p-5 shadow-card flex items-center justify-between">
            <div className="truncate pr-2">
              <p className="text-xs text-text-muted">{card.label}</p>
              <h3 className="text-lg lg:text-xl font-bold text-text-primary dark:text-white mt-1 truncate">{card.value}</h3>
              <p className="text-[10px] text-text-secondary dark:text-white/40 mt-0.5 truncate">{card.desc}</p>
            </div>
            <card.icon className={`w-8 h-8 flex-shrink-0 ${card.color}`} />
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 backdrop-blur-md bg-white/70 dark:bg-[#122315]/30 border border-white/20 dark:border-white/10 rounded-card p-4 shadow-card">
        <div className="flex flex-wrap gap-2 items-center">
          <Filter className="w-4 h-4 text-text-muted mr-1" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-button bg-white dark:bg-white/5 border border-light-gray dark:border-white/10 text-text-primary dark:text-white outline-none"
          >
            <option value="All" className="bg-[#142818]">All Categories</option>
            <option value="Fungicide" className="bg-[#142818]">Fungicide</option>
            <option value="Insecticide" className="bg-[#142818]">Insecticide</option>
            <option value="Seed Treatment" className="bg-[#142818]">Seed Treatment</option>
          </select>

          {['7d', '30d', '90d', '6m'].map((time) => (
            <button
              key={time}
              onClick={() => setTimeRange(time)}
              className={`px-3 py-1 text-xs rounded-full border transition-all ${
                timeRange === time
                  ? 'bg-deep-green text-white border-deep-green'
                  : 'border-light-gray dark:border-white/10 text-text-muted hover:bg-white/10'
              }`}
            >
              {time === '7d' ? '7 Days' : time === '30d' ? '30 Days' : time === '90d' ? '3 Months' : '6 Months'}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="Search product demand..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-60 pl-9 pr-4 py-1.5 text-xs rounded-button bg-white dark:bg-white/5 border border-light-gray dark:border-white/10 text-text-primary dark:text-white outline-none focus:ring-1 focus:ring-lime-green/30"
          />
        </div>
      </div>

      {/* Demand Line Chart */}
      <div className="backdrop-blur-md bg-white/70 dark:bg-[#122315]/30 border border-white/20 dark:border-white/10 rounded-card p-5 shadow-card">
        <h2 className="text-lg font-bold text-text-primary dark:text-white mb-4">
          Brand Demand Forecasting & Timeline Analysis
        </h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={MONTHLY_DEMAND} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" stroke="rgba(120,130,120,0.8)" tick={{ fontSize: 11 }} />
              <YAxis stroke="rgba(120,130,120,0.8)" tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#142818', borderColor: 'rgba(255,255,255,0.1)', color: '#fff', borderRadius: 8 }}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="Amistar 250 SC" stroke="#8BC34A" strokeWidth={2.5} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="Actara 25 WG" stroke="#1E88E5" strokeWidth={2} />
              <Line type="monotone" dataKey="Tilt 250 EC" stroke="#FFC107" strokeWidth={2} />
              <Line type="monotone" dataKey="Movondo" stroke="#E53935" strokeWidth={2} />
              <Line type="monotone" dataKey="Score 250 EC" stroke="#9C27B0" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grid: Product Performance Table vs Stock Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Table */}
        <div className="lg:col-span-2 backdrop-blur-md bg-white/70 dark:bg-[#122315]/30 border border-white/20 dark:border-white/10 rounded-card p-5 shadow-card overflow-hidden">
          <h2 className="text-lg font-bold text-text-primary dark:text-white mb-4">
            Product Sales & Demand Scorecards
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-light-gray dark:border-white/10 text-text-muted font-semibold uppercase tracking-wider pb-3">
                  <th className="py-3 px-2">Brand Product</th>
                  <th className="py-3 px-2">Category</th>
                  <th className="py-3 px-2 text-center">Units (30d)</th>
                  <th className="py-3 px-2 text-center">Revenue</th>
                  <th className="py-3 px-2 text-center">MoM Growth</th>
                  <th className="py-3 px-2 text-center">Stock Status</th>
                  <th className="py-3 px-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-light-gray dark:divide-white/5 text-text-primary dark:text-white/80">
                {filteredProducts.map((prod) => (
                  <tr key={prod.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-4 px-2 font-semibold text-text-primary dark:text-white">{prod.name}</td>
                    <td className="py-4 px-2 text-text-muted">{prod.category}</td>
                    <td className="py-4 px-2 text-center font-semibold">{prod.sold}</td>
                    <td className="py-4 px-2 text-center text-lime-green font-semibold">{prod.revenue}</td>
                    <td className="py-4 px-2 text-center font-bold">
                      <span className={`inline-flex items-center gap-0.5 ${prod.isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {prod.isPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                        {prod.growth}
                      </span>
                    </td>
                    <td className="py-4 px-2 text-center">
                      <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold ${getStockBadge(prod.stockStatus)}`}>
                        {prod.stockStatus}
                      </span>
                    </td>
                    <td className="py-4 px-2 text-right">
                      <button
                        onClick={() => handleRestockOrder(prod.name)}
                        className="px-2.5 py-1 rounded text-[10px] font-bold border border-lime-green/30 text-lime-green hover:bg-lime-green hover:text-white transition-all"
                      >
                        Reorder Stock
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Territory and supply Charts */}
        <div className="space-y-6">
          {/* Territory Demands */}
          <div className="backdrop-blur-md bg-white/70 dark:bg-[#122315]/30 border border-white/20 dark:border-white/10 rounded-card p-5 shadow-card">
            <h2 className="text-lg font-bold text-text-primary dark:text-white mb-4">
              Territory Demand Index (Units Sold)
            </h2>
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={TERRITORY_DEMAND} layout="vertical" margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis type="number" stroke="rgba(120,130,120,0.8)" tick={{ fontSize: 11 }} />
                  <YAxis dataKey="territory" type="category" stroke="rgba(120,130,120,0.8)" tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#142818', borderColor: 'rgba(255,255,255,0.1)', color: '#fff', borderRadius: 8 }}
                  />
                  <Bar dataKey="Units Sold" fill="#8BC34A" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
