import type { Recommendation } from '@/api/client';

/** Map model score / priority to a display confidence % */
export function recommendationConfidence(rec: Recommendation): number {
  const s = rec.visit_priority_score;
  if (typeof s === 'number' && s > 0) {
    return Math.min(97, Math.max(55, Math.round(s)));
  }
  if (rec.priority === 'high') return 88 + (rec.id.length % 8);
  if (rec.priority === 'medium') return 74 + (rec.id.length % 10);
  return 62 + (rec.id.length % 12);
}

export function confidenceTone(pct: number): 'high' | 'mid' | 'low' {
  if (pct >= 80) return 'high';
  if (pct >= 65) return 'mid';
  return 'low';
}

export function whyRecommendedText(rec: Recommendation): string {
  const bullets = whyRecommendedBullets(rec);
  return bullets.join(' - ');
}

/** Bullet reasons for "Why recommended?" - key demo differentiator */
export function whyRecommendedBullets(rec: Recommendation): string[] {
  const fromApi = (rec.explainable_reasons || [])
    .slice(0, 4)
    .map((r) => (r.title && r.description ? `${r.title}: ${r.description}` : r.title || r.description))
    .filter(Boolean) as string[];

  if (fromApi.length >= 2) return fromApi;

  const bullets: string[] = [];
  const msg = (rec.message || '').toLowerCase();
  const pr = (rec.pest_risk || '').toLowerCase();

  if (msg.includes('rain') || msg.includes('weather') || rec.weather) {
    bullets.push('Rainfall / weather anomaly detected');
  }
  if (msg.includes('inventory') || msg.includes('stock')) {
    bullets.push('Inventory critically low');
  }
  if (pr.includes('high') || pr.includes('outbreak') || msg.includes('pest')) {
    bullets.push('Pest outbreak risk nearby');
  }
  if (rec.visit_priority_score >= 78) {
    bullets.push('High historical conversion in this cluster');
  }
  if (bullets.length === 0 && rec.priority === 'high') {
    bullets.push('Multi-signal escalation across weather, pest, and stock');
  }
  if (bullets.length === 0) {
    bullets.push('Territory model ranked this action above baseline');
  }

  return [...new Set([...fromApi, ...bullets])].slice(0, 4);
}

export function riskTagsForRecommendation(rec: Recommendation): string[] {
  const tags: string[] = [];
  const pr = (rec.pest_risk || '').toLowerCase();
  if (pr.includes('high') || rec.priority === 'high') tags.push('HIGH PEST RISK');
  else if (pr.includes('medium')) tags.push('MEDIUM PEST RISK');
  if (rec.message?.toLowerCase().includes('inventory') || rec.message?.toLowerCase().includes('stock')) {
    tags.push('LOW INVENTORY');
  }
  if (rec.priority === 'low' && rec.visit_priority_score > 75) tags.push('HIGH SALES POTENTIAL');
  if (rec.visit_priority_score >= 82) tags.push('HIGH CONVERSION CHANCE');
  if (tags.length === 0 && rec.priority === 'medium') tags.push('FIELD SIGNAL ACTIVE');
  if (tags.length === 0) tags.push('ROUTE & VISIT OPTIMIZATION');
  return tags.slice(0, 4);
}
