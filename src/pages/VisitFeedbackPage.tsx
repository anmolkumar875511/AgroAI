import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CheckCircle2, Loader2, MapPin, Package, MessageSquare, CalendarDays } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { visitFeedbackAPI } from '@/api/client';
import { cn } from '@/lib/utils';

const VISIT_STATUSES = [
  { value: 'completed',         label: 'Visit Completed',      color: 'text-lime-green' },
  { value: 'no_purchase',       label: 'No Purchase Made',      color: 'text-accent-yellow' },
  { value: 'follow_up_needed',  label: 'Follow-up Needed',      color: 'text-info-blue' },
  { value: 'skipped',           label: 'Visit Skipped',         color: 'text-danger-red' },
];

const FARMER_RESPONSES = ['positive', 'neutral', 'negative'];

const PRODUCTS = [
  'Amistar 250 SC', 'Actara 25 WG', 'Score 250 EC', 'Miravis Duo',
  'Movondo', 'Vibrance Integral', 'Ridomil Gold', 'Axial 50 EC',
  'Tilt 250 EC', 'Custodia', 'Proclaim 5 SG', 'Pegasus 500 SC',
];

export default function VisitFeedbackPage() {
  const { user } = useAuth();
  const territory_id = user?.territory_id || 'TER_0001';
  const [searchParams] = useSearchParams();
  const initialRetailerId = searchParams.get('retailer_id') || '';
  const retailerName = searchParams.get('name') || '';

  const [form, setForm] = useState({
    retailer_id: initialRetailerId,
    visit_status: 'completed',
    products_discussed: [] as string[],
    order_placed: false,
    order_quantity: 0,
    order_value: 0,
    farmer_response: 'positive',
    follow_up_needed: false,
    next_follow_up_date: '',
    competitor_issue: '',
    notes: '',
  });

  useEffect(() => {
    if (initialRetailerId) {
      setForm(f => ({ ...f, retailer_id: initialRetailerId }));
    }
  }, [initialRetailerId]);

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const toggleProduct = (p: string) => {
    setForm(f => ({
      ...f,
      products_discussed: f.products_discussed.includes(p)
        ? f.products_discussed.filter(x => x !== p)
        : [...f.products_discussed, p],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.retailer_id.trim()) { setError('Retailer ID is required'); return; }
    setError('');
    setSubmitting(true);
    try {
      await visitFeedbackAPI.submitFeedback(form, territory_id);
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setSubmitted(false);
    setForm({
      retailer_id: '', visit_status: 'completed', products_discussed: [],
      order_placed: false, order_quantity: 0, order_value: 0,
      farmer_response: 'positive', follow_up_needed: false,
      next_follow_up_date: '', competitor_issue: '', notes: '',
    });
  };

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto text-center py-20">
        <div className="w-20 h-20 rounded-full bg-lime-green/10 flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 text-lime-green" />
        </div>
        <h2 className="text-2xl font-bold text-text-primary dark:text-white mb-2">Visit Recorded!</h2>
        <p className="text-sm text-text-muted mb-8">
          Outcome for {form.retailer_id} has been saved.
          {form.follow_up_needed && ' A follow-up reminder has been created.'}
        </p>
        <button onClick={reset}
          className="px-8 py-3 rounded-button gradient-primary text-white font-semibold hover:brightness-110 transition-all shadow-glow-green">
          Log Another Visit
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-10">
      <div>
        <h2 className="text-2xl lg:text-3xl font-bold text-text-primary dark:text-white">Visit Update / Feedback</h2>
        <p className="mt-1 text-sm text-text-secondary dark:text-white/60">
          Record visit outcomes to improve future AI recommendations.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="px-4 py-3 rounded-lg bg-danger-red/10 border border-danger-red/30 text-danger-red text-sm">{error}</div>
        )}

        {/* Retailer ID */}
        <div className="bg-white dark:bg-white/5 rounded-card shadow-card border border-transparent dark:border-white/5 p-5">
          <div className="flex justify-between items-center mb-3">
            <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider">
              <MapPin className="w-3.5 h-3.5 inline mr-1.5" />Retailer ID *
            </label>
            {initialRetailerId && (
              <span className="px-2 py-0.5 rounded bg-lime-green/10 text-lime-green text-[10px] font-bold uppercase animate-pulse">
                Pre-filled {retailerName ? `(${retailerName})` : ''}
              </span>
            )}
          </div>
          <input type="text" required value={form.retailer_id}
            onChange={e => setForm(f => ({ ...f, retailer_id: e.target.value }))}
            placeholder="e.g. RTL_00001"
            className="w-full px-4 py-2.5 rounded-lg bg-light-gray dark:bg-white/5 border border-transparent dark:border-white/10 text-sm text-text-primary dark:text-white outline-none focus:border-lime-green/50 transition-colors"
          />
        </div>

        {/* Visit Status */}
        <div className="bg-white dark:bg-white/5 rounded-card shadow-card border border-transparent dark:border-white/5 p-5">
          <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Visit Status</label>
          <div className="grid grid-cols-2 gap-2">
            {VISIT_STATUSES.map(s => (
              <button type="button" key={s.value}
                onClick={() => setForm(f => ({ ...f, visit_status: s.value }))}
                className={cn(
                  'px-4 py-2.5 rounded-lg text-sm font-medium border transition-all text-left',
                  form.visit_status === s.value
                    ? 'bg-deep-green/10 border-deep-green/30 text-deep-green dark:bg-lime-green/10 dark:border-lime-green/30 dark:text-lime-green'
                    : 'bg-light-gray dark:bg-white/5 border-transparent text-text-primary dark:text-white/70 hover:bg-light-gray/80 dark:hover:bg-white/10'
                )}>
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Products Discussed */}
        <div className="bg-white dark:bg-white/5 rounded-card shadow-card border border-transparent dark:border-white/5 p-5">
          <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
            <Package className="w-3.5 h-3.5 inline mr-1.5" />Products Discussed
          </label>
          <div className="flex flex-wrap gap-2">
            {PRODUCTS.map(p => (
              <button type="button" key={p}
                onClick={() => toggleProduct(p)}
                className={cn(
                  'px-3 py-1.5 rounded-full text-xs font-medium border transition-all',
                  form.products_discussed.includes(p)
                    ? 'gradient-primary text-white border-transparent'
                    : 'bg-light-gray dark:bg-white/5 border-transparent text-text-muted hover:text-text-primary dark:hover:text-white hover:bg-light-gray/80'
                )}>
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Order */}
        <div className="bg-white dark:bg-white/5 rounded-card shadow-card border border-transparent dark:border-white/5 p-5 space-y-4">
          <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider">Order Details</label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={form.order_placed}
              onChange={e => setForm(f => ({ ...f, order_placed: e.target.checked }))}
              className="w-4 h-4 rounded accent-lime-green" />
            <span className="text-sm text-text-primary dark:text-white font-medium">Order was placed</span>
          </label>
          {form.order_placed && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-text-muted mb-1 block">Quantity (units)</label>
                <input type="number" min="0" value={form.order_quantity}
                  onChange={e => setForm(f => ({ ...f, order_quantity: Number(e.target.value) }))}
                  className="w-full px-3 py-2 rounded-lg bg-light-gray dark:bg-white/5 border border-transparent dark:border-white/10 text-sm text-text-primary dark:text-white outline-none focus:border-lime-green/50 transition-colors"
                />
              </div>
              <div>
                <label className="text-xs text-text-muted mb-1 block">Order Value (₹)</label>
                <input type="number" min="0" value={form.order_value}
                  onChange={e => setForm(f => ({ ...f, order_value: Number(e.target.value) }))}
                  className="w-full px-3 py-2 rounded-lg bg-light-gray dark:bg-white/5 border border-transparent dark:border-white/10 text-sm text-text-primary dark:text-white outline-none focus:border-lime-green/50 transition-colors"
                />
              </div>
            </div>
          )}
        </div>

        {/* Farmer Response */}
        <div className="bg-white dark:bg-white/5 rounded-card shadow-card border border-transparent dark:border-white/5 p-5">
          <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Farmer / Retailer Response</label>
          <div className="flex gap-2">
            {FARMER_RESPONSES.map(r => (
              <button type="button" key={r}
                onClick={() => setForm(f => ({ ...f, farmer_response: r }))}
                className={cn(
                  'flex-1 py-2 rounded-lg text-sm font-medium capitalize border transition-all',
                  form.farmer_response === r
                    ? r === 'positive' ? 'bg-lime-green/10 border-lime-green/30 text-lime-green'
                      : r === 'negative' ? 'bg-danger-red/10 border-danger-red/30 text-danger-red'
                      : 'bg-accent-yellow/10 border-accent-yellow/30 text-accent-yellow'
                    : 'bg-light-gray dark:bg-white/5 border-transparent text-text-muted hover:bg-light-gray/80'
                )}>
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Follow-up */}
        <div className="bg-white dark:bg-white/5 rounded-card shadow-card border border-transparent dark:border-white/5 p-5 space-y-4">
          <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider">
            <CalendarDays className="w-3.5 h-3.5 inline mr-1.5" />Follow-up
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={form.follow_up_needed}
              onChange={e => setForm(f => ({ ...f, follow_up_needed: e.target.checked }))}
              className="w-4 h-4 rounded accent-lime-green" />
            <span className="text-sm text-text-primary dark:text-white font-medium">Follow-up required</span>
          </label>
          {form.follow_up_needed && (
            <div>
              <label className="text-xs text-text-muted mb-1 block">Next Follow-up Date</label>
              <input type="date" value={form.next_follow_up_date}
                onChange={e => setForm(f => ({ ...f, next_follow_up_date: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg bg-light-gray dark:bg-white/5 border border-transparent dark:border-white/10 text-sm text-text-primary dark:text-white outline-none focus:border-lime-green/50 transition-colors"
              />
            </div>
          )}
        </div>

        {/* Competitor + Notes */}
        <div className="bg-white dark:bg-white/5 rounded-card shadow-card border border-transparent dark:border-white/5 p-5 space-y-4">
          <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider">
            <MessageSquare className="w-3.5 h-3.5 inline mr-1.5" />Additional Details
          </label>
          <div>
            <label className="text-xs text-text-muted mb-1 block">Competitor Issue (if any)</label>
            <input type="text" value={form.competitor_issue}
              onChange={e => setForm(f => ({ ...f, competitor_issue: e.target.value }))}
              placeholder="e.g. Customer comparing with XYZ brand"
              className="w-full px-3 py-2 rounded-lg bg-light-gray dark:bg-white/5 border border-transparent dark:border-white/10 text-sm text-text-primary dark:text-white outline-none focus:border-lime-green/50 transition-colors"
            />
          </div>
          <div>
            <label className="text-xs text-text-muted mb-1 block">Notes</label>
            <textarea value={form.notes} rows={3}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              placeholder="Any observations, feedback from farmer, or next steps..."
              className="w-full px-3 py-2 rounded-lg bg-light-gray dark:bg-white/5 border border-transparent dark:border-white/10 text-sm text-text-primary dark:text-white outline-none focus:border-lime-green/50 transition-colors resize-none"
            />
          </div>
        </div>

        <button type="submit" disabled={submitting}
          className="w-full py-4 rounded-button gradient-primary text-white font-semibold text-base shadow-glow-green hover:brightness-110 transition-all flex items-center justify-center gap-2 disabled:opacity-70">
          {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
          {submitting ? 'Saving Visit…' : 'Submit Visit Update'}
        </button>
      </form>
    </div>
  );
}
