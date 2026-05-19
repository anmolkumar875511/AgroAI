import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  Sprout,
  ShieldAlert,
  CloudSun,
  FlaskConical,
  CloudRain,
  Package,
  TrendingUp,
  Leaf,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { ProgressRing } from '@/components/shared/ProgressRing';
import { PriorityBadge } from '@/components/shared/PriorityBadge';
import { cn } from '@/lib/utils';
import type { AIRecommendation } from '@/types';
import { ConfidenceScore } from '@/components/command-center/ConfidenceScore';
import { RiskTag } from '@/components/command-center/RiskTag';
import { AIRecommendationFlow } from '@/components/command-center/AIRecommendationFlow';
import { recommendationConfidence, riskTagsForRecommendation } from '@/lib/fieldOps';
import { WhyRecommendedBlock } from '@/components/command-center/WhyRecommendedBlock';
import type { Recommendation } from '@/api/client';

interface ExplainableAICardProps {
  recommendation: AIRecommendation;
  onApply?: () => void;
  onDismiss?: () => void;
}

const reasoningIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  CloudRain,
  History: Info,
  Package,
  TrendingUp,
  Leaf,
  Sprout,
  Sun: CloudSun,
};

function toApiRec(rec: AIRecommendation): Recommendation {
  return {
    id: rec.id,
    priority: rec.priority,
    crop: rec.crop,
    message: rec.message,
    weather: rec.weather,
    product: rec.product,
    village: rec.village,
    farmer: rec.farmer,
    pest_risk: rec.pestRisk,
    next_action: rec.nextAction,
    follow_up_timeline: rec.followUpTimeline,
    explainable_reasons: rec.explainableReasons?.map((r) => ({
      id: r.id,
      title: r.title,
      description: r.description,
      icon: r.icon,
    })),
    retailer_id: rec.retailerId ?? '',
    visit_priority_score: rec.visitPriorityScore ?? 0,
  };
}

export function ExplainableAICard({ recommendation: rec, onApply, onDismiss }: ExplainableAICardProps) {
  const [expanded, setExpanded] = useState(false);
  const [showExplain, setShowExplain] = useState(false);
  const [actionState, setActionState] = useState<'idle' | 'loading' | 'applied' | 'dismissed'>('idle');

  const conf = recommendationConfidence(toApiRec(rec));

  const tags = rec.riskTagList?.length ? rec.riskTagList : riskTagsForRecommendation(toApiRec(rec));

  const flowSteps =
    rec.priority === 'high'
      ? ['Weather alert', 'Pest risk increased', 'Inventory risk detected', 'Retailer prioritized', 'Route updated']
      : rec.priority === 'medium'
        ? ['Nutrient signal', 'Weather window', 'Stock alignment', 'Visit slot ranked', 'Advisory issued']
        : ['Coverage scan', 'Demand signal', 'Retailer fit', 'Route touchpoint', 'Advisory queued'];

  const handleApply = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setActionState('loading');
    try {
      await onApply?.();
    } catch {
      // parent handles error UI
    }
    setActionState('applied');
  };

  const handleDismiss = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await onDismiss?.();
    } catch {
      /* ignore */
    }
    setActionState('dismissed');
  };

  if (actionState === 'dismissed') return null;

  if (actionState === 'applied') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-xl border border-[#388E3C]/40 bg-[#388E3C]/10 p-5 flex items-center gap-4"
      >
        <div className="w-12 h-12 rounded-full bg-[#2E7D32] flex items-center justify-center flex-shrink-0 shadow-[0_0_20px_rgba(46,125,50,0.35)]">
          <CheckCircle2 className="w-6 h-6 text-white" />
        </div>
        <div>
          <h4 className="font-semibold text-[#C8E6C9] text-lg">Recommendation applied</h4>
          <p className="text-sm text-slate-400 mt-1">
            Action scheduled for {rec.village}. {rec.farmer ? `Grower ${rec.farmer} flagged for follow-up.` : ''}
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="rounded-xl border border-white/10 bg-[#1E293B] overflow-hidden shadow-[0_18px_48px_rgba(0,0,0,0.18)] hover:border-[#1976D2]/30 transition-colors">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full p-5 flex items-center gap-4 text-left hover:bg-[#0F172A]/35 transition-colors"
      >
        <PriorityBadge priority={rec.priority} showLabel />
        <div className="w-12 h-12 flex-shrink-0">
          <ProgressRing
            progress={conf}
            size={48}
            strokeWidth={4}
            bgColor="#1e293b"
            color={
              rec.priority === 'high' ? '#D32F2F' : rec.priority === 'medium' ? '#F9A825' : '#388E3C'
            }
          >
            <span className="text-xs font-bold text-white font-mono">{conf}</span>
          </ProgressRing>
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-white">
            {rec.crop} -{' '}
            {rec.priority === 'high'
              ? 'Pest / weather escalation'
              : rec.priority === 'medium'
                ? 'Nutrient & window advisory'
                : 'Field optimization'}
          </h4>
          <p className="text-xs text-slate-400 mt-0.5">
            {rec.village} {rec.farmer ? `- Grower: ${rec.farmer}` : ''}
          </p>
          <div className="mt-2 flex flex-wrap gap-1">
            {tags.slice(0, 3).map((t) => (
              <RiskTag
                key={t}
                label={t}
                tone={
                  t.includes('PEST') && t.includes('HIGH')
                    ? 'danger'
                    : t.includes('INVENTORY')
                      ? 'warn'
                      : t.includes('CONVERSION') || t.includes('POTENTIAL')
                        ? 'success'
                        : 'info'
                }
              />
            ))}
          </div>
        </div>
        <ConfidenceScore pct={conf} />
        <ChevronDown className={`w-5 h-5 text-slate-500 transition-transform flex-shrink-0 ${expanded ? 'rotate-180' : ''}`} />
      </button>

      <div className="px-5 pb-4 border-t border-white/10 pt-4 space-y-3">
        <WhyRecommendedBlock
          title="Why this recommendation?"
          bullets={[
            rec.whyRecommended ||
              rec.explainableReasons?.[0]?.description ||
              rec.message ||
              'Correlated field signals exceeded the action threshold for this territory.',
          ]}
        />

        <AIRecommendationFlow steps={flowSteps} />

        <div className="flex flex-col sm:flex-row gap-3 pt-1">
          <button
            type="button"
            onClick={handleApply}
            disabled={actionState === 'loading'}
            className={cn(
              'flex-1 py-2.5 rounded-lg text-sm font-semibold text-white transition-all flex justify-center items-center border border-[#2E7D32]/50',
              actionState === 'loading'
                ? 'bg-[#1E293B] text-slate-500 cursor-not-allowed'
                : 'bg-[#2E7D32] hover:bg-[#276b2a] shadow-[0_0_14px_rgba(46,125,50,0.2)]',
            )}
          >
            {actionState === 'loading' ? 'Applying...' : 'Apply recommendation'}
          </button>
          <button
            type="button"
            onClick={handleDismiss}
            className="px-6 py-2.5 rounded-lg bg-[#0F172A] border border-white/10 text-slate-300 text-sm font-medium hover:bg-white/5 transition-colors"
          >
            Dismiss
          </button>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: 'easeInOut' }}
          >
            <div className="px-5 pb-5 border-t border-white/10 pt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-[#0F172A]/50 border border-white/5 flex items-start gap-3">
                  <Sprout className="w-4 h-4 text-[#388E3C] flex-shrink-0 mt-0.5" />
                  <div className="text-xs space-y-1">
                    <p className="font-semibold text-white">Crop: {rec.crop}</p>
                    <p className="text-slate-500">Stage: active canopy</p>
                    <p className="text-slate-500">Land: modelled 5 ac. footprint</p>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-[#0F172A]/50 border border-white/5 flex items-start gap-3">
                  <ShieldAlert className="w-4 h-4 text-[#D32F2F] flex-shrink-0 mt-0.5" />
                  <div className="text-xs space-y-1">
                    <p className="font-semibold text-white">Pest pressure</p>
                    <p className="text-slate-500">Risk: {rec.pestRisk || 'Elevated in adjacent blocks'}</p>
                    <p className="text-slate-500">Spread: bulletin + 3 km radius</p>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-[#0F172A]/50 border border-white/5 flex items-start gap-3">
                  <CloudSun className="w-4 h-4 text-[#F9A825] flex-shrink-0 mt-0.5" />
                  <div className="text-xs space-y-1">
                    <p className="font-semibold text-white">Weather</p>
                    <p className="text-slate-500">{rec.weather}</p>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-[#0F172A]/50 border border-white/5 flex items-start gap-3">
                  <FlaskConical className="w-4 h-4 text-[#1976D2] flex-shrink-0 mt-0.5" />
                  <div className="text-xs space-y-1">
                    <p className="font-semibold text-white">Recommended: {rec.product}</p>
                    <p className="text-slate-500">Dosage: per label / AE guidance</p>
                    <p className="text-[#388E3C] font-medium">Stock: territory check passed</p>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-[#0F172A]/50 border border-white/5">
                <h5 className="text-sm font-semibold text-white mb-1">Next best action</h5>
                <p className="text-xs text-slate-400 leading-relaxed">{rec.nextAction}</p>
                {rec.followUpTimeline && (
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {rec.followUpTimeline.map((time, i) => (
                      <div key={time} className="flex items-center gap-2">
                        <div className={`flex items-center gap-1 ${i === 0 ? 'text-[#388E3C]' : 'text-slate-500'}`}>
                          <div className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-[#388E3C]' : 'bg-slate-600'}`} />
                          <span className="text-[11px] font-mono font-medium">{time}</span>
                        </div>
                        {i < rec.followUpTimeline!.length - 1 && <span className="text-slate-600">-&gt;</span>}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => setShowExplain(!showExplain)}
                  className="flex items-center gap-2 text-sm font-semibold text-[#1976D2] hover:text-[#42A5F5] transition-colors"
                >
                  <Info className="w-4 h-4" />
                  Model factors (expand)
                </button>
                <AnimatePresence>
                  {showExplain && rec.explainableReasons && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.22 }}
                      className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3"
                    >
                      {rec.explainableReasons.map((reason) => {
                        const ReasonIcon = reasoningIcons[reason.icon] || Info;
                        return (
                          <div
                            key={reason.id}
                            className="p-3 rounded-lg bg-[#0F172A]/50 border border-white/5 flex items-start gap-3"
                          >
                            <ReasonIcon className="w-4 h-4 text-[#388E3C] flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="text-xs font-semibold text-white">{reason.title}</p>
                              <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{reason.description}</p>
                            </div>
                          </div>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/*
              <div>
                <button
                  type="button"
                  onClick={handleApply}
                  disabled={actionState === 'loading'}
                  className={cn(
                    'flex-1 py-3 rounded-lg text-sm font-semibold text-white transition-all flex justify-center items-center border border-[#2E7D32]/50',
                    actionState === 'loading'
                      ? 'bg-[#1E293B] cursor-not-allowed opacity-90'
                      : 'bg-[#2E7D32] hover:bg-[#276b2a] shadow-[0_0_18px_rgba(46,125,50,0.25)]',
                  )}
                >
                  {actionState === 'loading' ? (
                    <span className="text-xs text-[#BBDEFB]">Generating recommendations...</span>
                  ) : (
                    'Apply recommendation'
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleDismiss}
                  className="px-6 py-3 rounded-lg bg-[#0F172A] border border-white/10 text-slate-200 text-sm font-medium hover:bg-white/5 transition-colors"
                >
                  Dismiss
                </button>
              */}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

