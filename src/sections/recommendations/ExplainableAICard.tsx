import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown, Sprout, ShieldAlert, CloudSun, FlaskConical, Info,
  CloudRain, Package, TrendingUp, Leaf, CheckCircle2,
} from 'lucide-react';
import { ProgressRing } from '@/components/shared/ProgressRing';
import { PriorityBadge } from '@/components/shared/PriorityBadge';
import { cn } from '@/lib/utils';
import type { AIRecommendation } from '@/types';

interface ExplainableAICardProps {
  recommendation: AIRecommendation;
  onApply?: () => void;   // NEW — called after apply action
  onDismiss?: () => void; // NEW — called after dismiss action
}

const reasoningIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  CloudRain, History: Info, Package, TrendingUp, Leaf, Sprout, Sun: CloudSun,
};

export function ExplainableAICard({ recommendation: rec, onApply, onDismiss }: ExplainableAICardProps) {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);
  const [showExplain, setShowExplain] = useState(false);
  const [actionState, setActionState] = useState<'idle' | 'loading' | 'applied' | 'dismissed'>('idle');

  const priority = rec.priority?.toLowerCase();
  const score = priority === 'critical' || priority === 'high' ? 92 : priority === 'medium' ? 75 : 58;

  const handleApply = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setActionState('loading');
    try {
      await onApply?.();   // CHANGED: calls backend via prop
    } catch {
      // ignore — parent already handles error
    }
    setActionState('applied');
  };

  const handleDismiss = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await onDismiss?.(); // CHANGED: calls backend via prop
    } catch {}
    setActionState('dismissed');
  };

  if (actionState === 'dismissed') return null;

  if (actionState === 'applied') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-lime-green/10 border border-lime-green/30 rounded-card p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-lime-green flex items-center justify-center flex-shrink-0 shadow-glow-green">
            <CheckCircle2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h4 className="font-semibold text-deep-green dark:text-lime-green text-base md:text-lg">Recommendation Applied</h4>
            <p className="text-xs md:text-sm text-deep-green/80 dark:text-lime-green/80 mt-1">
              Action scheduled for {rec.village}. {rec.farmer ? `Farmer ${rec.farmer} notified.` : ''}
            </p>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap md:flex-nowrap">
          <button
            onClick={() => navigate('/visit-planner')}
            className="px-3.5 py-1.5 rounded-button bg-deep-green text-white hover:bg-deep-green/90 dark:bg-lime-green dark:text-deep-forest dark:hover:bg-lime-green/95 text-xs font-bold transition-all shadow-glow-green"
          >
            Go to Planner
          </button>
          <button
            onClick={() => navigate(`/visit-feedback?retailer_id=${rec.retailer_id || ''}&name=${encodeURIComponent(rec.village)}`)}
            className="px-3.5 py-1.5 rounded-button bg-deep-green/15 text-deep-green border border-deep-green/30 hover:bg-deep-green/20 dark:bg-lime-green/20 dark:text-lime-green dark:border-lime-green/30 dark:hover:bg-lime-green/30 text-xs font-bold transition-all"
          >
            Log Feedback
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="backdrop-blur-md bg-white/80 dark:bg-[#121b14]/40 rounded-2xl shadow-md border border-white/30 dark:border-white/5 overflow-hidden hover:shadow-lg hover:border-white/50 dark:hover:border-white/10 transition-all duration-300">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-5 flex items-center gap-4 text-left hover:bg-light-gray/40 dark:hover:bg-white/10 transition-colors"
      >
        <PriorityBadge priority={rec.priority} showLabel />
        <div className="w-12 h-12 flex-shrink-0">
          <ProgressRing progress={score} size={48} strokeWidth={4}
            color={priority === 'critical' || priority === 'high' ? '#E53935' : priority === 'medium' ? '#FFC107' : '#8BC34A'}>
            <span className="text-xs font-bold text-text-primary dark:text-white">{score}</span>
          </ProgressRing>
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-text-primary dark:text-white">
            {rec.crop} — {priority === 'critical' || priority === 'high' ? 'Pest Risk Alert' : priority === 'medium' ? 'Nutrient Advisory' : 'General Advisory'}
          </h4>
          <p className="text-xs text-text-muted mt-0.5">
            {rec.village} {rec.farmer ? `| Farmer: ${rec.farmer}` : ''}
          </p>
        </div>
        <ChevronDown className={`w-5 h-5 text-text-muted transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </button>

      {/* Expanded */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <div className="px-5 pb-5 border-t border-light-gray/40 dark:border-white/5 pt-4 space-y-4">
              {/* Detail Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3 rounded-xl bg-light-gray/40 dark:bg-[#0b150c]/40 border border-light-gray/20 dark:border-white/5 flex items-start gap-3">
                  <Sprout className="w-4 h-4 text-lime-green flex-shrink-0 mt-0.5 animate-pulse-slow" />
                  <div className="text-xs space-y-1">
                    <p className="font-semibold text-text-primary dark:text-white">Crop: {rec.crop}</p>
                    <p className="text-text-muted dark:text-white/60">Stage: Tillering</p>
                    <p className="text-text-muted dark:text-white/60">Land: 5 acres</p>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-light-gray/40 dark:bg-[#0b150c]/40 border border-light-gray/20 dark:border-white/5 flex items-start gap-3">
                  <ShieldAlert className="w-4 h-4 text-danger-red flex-shrink-0 mt-0.5" />
                  <div className="text-xs space-y-1">
                    <p className="font-semibold text-text-primary dark:text-white">Pest: Stem Borer</p>
                    <p className="text-text-muted dark:text-white/60">Risk: {rec.pestRisk}</p>
                    <p className="text-text-muted dark:text-white/60">Spread: 3 adjacent fields</p>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-light-gray/40 dark:bg-[#0b150c]/40 border border-light-gray/20 dark:border-white/5 flex items-start gap-3">
                  <CloudSun className="w-4 h-4 text-accent-yellow flex-shrink-0 mt-0.5" />
                  <div className="text-xs space-y-1">
                    <p className="font-semibold text-text-primary dark:text-white">Temp: 32°C</p>
                    <p className="text-text-muted dark:text-white/60">Humidity: 75%</p>
                    <p className="text-text-muted dark:text-white/60">Rain: 20% chance</p>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-light-gray/40 dark:bg-[#0b150c]/40 border border-light-gray/20 dark:border-white/5 flex items-start gap-3">
                  <FlaskConical className="w-4 h-4 text-info-blue flex-shrink-0 mt-0.5" />
                  <div className="text-xs space-y-1">
                    <p className="font-semibold text-text-primary dark:text-white">Recommended: {rec.product}</p>
                    <p className="text-text-muted dark:text-white/60">Dosage: 200ml/acre</p>
                    <p className="text-lime-green font-semibold">Stock: Available</p>
                  </div>
                </div>
              </div>

              {/* Next Best Action */}
              <div className="p-4 rounded-2xl bg-light-gray/40 dark:bg-[#0b150c]/40 border border-light-gray/20 dark:border-white/5">
                <h5 className="text-sm font-semibold text-text-primary dark:text-white mb-2">Next Best Action</h5>
                <p className="text-xs text-text-secondary dark:text-white/70 leading-relaxed">{rec.nextAction}</p>
                {rec.followUpTimeline && (
                  <div className="mt-3 flex items-center gap-2">
                    {rec.followUpTimeline.map((time, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className={`flex items-center gap-1 ${i === 0 ? 'text-lime-green font-semibold' : 'text-text-muted'}`}>
                          <div className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-lime-green animate-pulse' : 'bg-text-muted/30'}`} />
                          <span className="text-[11px] font-medium">{time}</span>
                        </div>
                        {i < rec.followUpTimeline!.length - 1 && <span className="text-text-muted/30">→</span>}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Explainable AI */}
              <div>
                <button onClick={() => setShowExplain(!showExplain)}
                  className="flex items-center gap-2 text-sm font-semibold text-deep-green dark:text-lime-green hover:underline">
                  <Info className="w-4 h-4" />
                  Why this recommendation?
                </button>
                <AnimatePresence>
                  {showExplain && rec.explainableReasons && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}
                      className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3"
                    >
                      {rec.explainableReasons.map((reason) => {
                        const ReasonIcon = reasoningIcons[reason.icon] || Info;
                        return (
                          <div key={reason.id} className="p-3 rounded-xl bg-light-gray/40 dark:bg-[#0b150c]/40 border border-light-gray/20 dark:border-white/5 flex items-start gap-3">
                            <ReasonIcon className="w-4 h-4 text-lime-green flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="text-xs font-semibold text-text-primary dark:text-white">{reason.title}</p>
                              <p className="text-[11px] text-text-muted dark:text-white/60 mt-0.5 leading-relaxed">{reason.description}</p>
                            </div>
                          </div>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 mt-2 border-t border-light-gray/40 dark:border-white/5 flex flex-col sm:flex-row gap-3">
                <button onClick={handleApply} disabled={actionState === 'loading'}
                  className={cn(
                    'flex-1 py-3 rounded-xl text-sm font-semibold text-white transition-all flex justify-center items-center shadow-glow-green hover:scale-[1.02]',
                    actionState === 'loading' ? 'bg-deep-green opacity-80 cursor-not-allowed' : 'gradient-primary hover:brightness-110'
                  )}>
                  {actionState === 'loading'
                    ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : 'Apply Recommendation'}
                </button>
                <button onClick={handleDismiss}
                  className="px-6 py-3 rounded-xl bg-light-gray/60 dark:bg-white/5 text-text-primary dark:text-white text-sm font-semibold hover:bg-light-gray dark:hover:bg-white/10 transition-all hover:scale-[1.02]">
                  Dismiss
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
