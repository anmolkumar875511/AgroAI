import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Sprout, ShieldAlert, CloudSun, FlaskConical, Info, CloudRain, Package, TrendingUp, Leaf } from 'lucide-react';
import { ProgressRing } from '@/components/shared/ProgressRing';
import { PriorityBadge } from '@/components/shared/PriorityBadge';
import type { AIRecommendation } from '@/types';

interface ExplainableAICardProps {
  recommendation: AIRecommendation;
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

export function ExplainableAICard({ recommendation: rec }: ExplainableAICardProps) {
  const [expanded, setExpanded] = useState(false);
  const [showExplain, setShowExplain] = useState(false);

  const score = rec.priority === 'high' ? 92 : rec.priority === 'medium' ? 75 : 58;

  return (
    <div className="bg-white dark:bg-white/5 rounded-card shadow-card border border-transparent dark:border-white/5 overflow-hidden">
      {/* Collapsed Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-5 flex items-center gap-4 text-left hover:bg-light-gray/30 dark:hover:bg-white/5 transition-colors"
      >
        <PriorityBadge priority={rec.priority} showLabel />
        <div className="w-12 h-12 flex-shrink-0">
          <ProgressRing progress={score} size={48} strokeWidth={4} color={
            rec.priority === 'high' ? '#E53935' : rec.priority === 'medium' ? '#FFC107' : '#8BC34A'
          }>
            <span className="text-xs font-bold text-text-primary dark:text-white">{score}</span>
          </ProgressRing>
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-text-primary dark:text-white">
            {rec.crop} - {rec.priority === 'high' ? 'Pest Risk Alert' : rec.priority === 'medium' ? 'Nutrient Advisory' : 'General Advisory'}
          </h4>
          <p className="text-xs text-text-muted mt-0.5">
            {rec.village} {rec.farmer ? `| Farmer: ${rec.farmer}` : ''}
          </p>
        </div>
        <ChevronDown className={`w-5 h-5 text-text-muted transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </button>

      {/* Expanded Content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <div className="px-5 pb-5 border-t border-light-gray dark:border-white/10 pt-4 space-y-4">
              {/* Detail Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-off-white dark:bg-white/5 flex items-start gap-3">
                  <Sprout className="w-4 h-4 text-lime-green flex-shrink-0 mt-0.5" />
                  <div className="text-xs space-y-1">
                    <p className="font-semibold text-text-primary dark:text-white">Crop: {rec.crop}</p>
                    <p className="text-text-muted">Stage: Tillering</p>
                    <p className="text-text-muted">Land: 5 acres</p>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-off-white dark:bg-white/5 flex items-start gap-3">
                  <ShieldAlert className="w-4 h-4 text-danger-red flex-shrink-0 mt-0.5" />
                  <div className="text-xs space-y-1">
                    <p className="font-semibold text-text-primary dark:text-white">Pest: Stem Borer</p>
                    <p className="text-text-muted">Risk: {rec.pestRisk}</p>
                    <p className="text-text-muted">Spread: 3 adjacent fields</p>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-off-white dark:bg-white/5 flex items-start gap-3">
                  <CloudSun className="w-4 h-4 text-accent-yellow flex-shrink-0 mt-0.5" />
                  <div className="text-xs space-y-1">
                    <p className="font-semibold text-text-primary dark:text-white">Temp: 32C</p>
                    <p className="text-text-muted">Humidity: 75%</p>
                    <p className="text-text-muted">Rain: 20% chance</p>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-off-white dark:bg-white/5 flex items-start gap-3">
                  <FlaskConical className="w-4 h-4 text-info-blue flex-shrink-0 mt-0.5" />
                  <div className="text-xs space-y-1">
                    <p className="font-semibold text-text-primary dark:text-white">Recommended: {rec.product}</p>
                    <p className="text-text-muted">Dosage: 200ml/acre</p>
                    <p className="text-lime-green font-medium">Stock: Available</p>
                  </div>
                </div>
              </div>

              {/* Next Best Action */}
              <div className="p-4 rounded-lg bg-off-white dark:bg-white/5">
                <h5 className="text-sm font-semibold text-text-primary dark:text-white mb-2">Next Best Action</h5>
                <p className="text-xs text-text-secondary dark:text-white/60 leading-relaxed">
                  {rec.nextAction}
                </p>
                {/* Timeline */}
                <div className="mt-3 flex items-center gap-2">
                  {rec.followUpTimeline?.map((time, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className={`flex items-center gap-1 ${i === 0 ? 'text-lime-green' : 'text-text-muted'}`}>
                        <div className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-lime-green' : 'bg-text-muted/30'}`} />
                        <span className="text-[11px] font-medium">{time}</span>
                      </div>
                      {i < (rec.followUpTimeline?.length || 0) - 1 && (
                        <span className="text-text-muted/30">-&gt;</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Explainable AI */}
              <div>
                <button
                  onClick={() => setShowExplain(!showExplain)}
                  className="flex items-center gap-2 text-sm font-semibold text-deep-green dark:text-lime-green hover:underline"
                >
                  <Info className="w-4 h-4" />
                  Why this recommendation?
                </button>

                <AnimatePresence>
                  {showExplain && rec.explainableReasons && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3"
                    >
                      {rec.explainableReasons.map((reason) => {
                        const ReasonIcon = reasoningIcons[reason.icon] || Info;
                        return (
                          <div key={reason.id} className="p-3 rounded-lg bg-off-white dark:bg-white/5 flex items-start gap-3">
                            <ReasonIcon className="w-4 h-4 text-lime-green flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="text-xs font-semibold text-text-primary dark:text-white">{reason.title}</p>
                              <p className="text-[11px] text-text-muted mt-0.5 leading-relaxed">{reason.description}</p>
                            </div>
                          </div>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
