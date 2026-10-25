'use client';

import { PreviewSection, PreviewStack } from '@/components/preview/preview-section';
import { StatsOverview, type Metric, type StatsRange } from '@/registry/kosmos/blocks/stats-overview/stats-overview';

const frame = 'w-full rounded-xl border border-transparent bg-background p-4 shadow-card';

const everyRange = <T,>(value: T): Record<StatsRange, T> => ({ '7d': value, '30d': value, '90d': value });

const emptyMetrics: Metric[] = [
  { id: 'users', label: 'Active users', value: 0, format: 'number', points: [] },
  { id: 'events', label: 'Events', value: 0, format: 'number', points: [] },
  { id: 'revenue', label: 'Monthly revenue', value: 0, format: 'currency', points: [] },
  { id: 'projects', label: 'Live projects', value: 0, format: 'number', points: [] },
];

const longPoints = ['Oct 5', 'Oct 6', 'Oct 7', 'Oct 8', 'Oct 9', 'Oct 10', 'Oct 11'].map((label, i) => ({
  label,
  current: 0.4 + i * 0.05,
  previous: 0.6 - i * 0.02,
}));

const longMetrics: Metric[] = [
  { id: 'events', label: 'Events received across every project and region', value: 1_284_502_920, format: 'number', change: 1240.5, points: longPoints },
  { id: 'revenue', label: 'Monthly revenue', value: 3, format: 'currency', change: -66.7, points: longPoints },
  { id: 'errors', label: 'Error rate', value: 0.7, format: 'percent', change: 0.3, goodWhen: 'down', points: longPoints },
  { id: 'projects', label: 'Live projects', value: 8, format: 'number', points: longPoints },
];

const longEvents = [
  { name: 'subscription_trial_converted_to_annual_plan', count: 1_920_000 },
  { name: 'page_viewed', count: 1_200 },
  { name: 'signed_up', count: 1 },
];

export default function StatsOverviewPreview() {
  return (
    <PreviewStack>
      <PreviewSection title="Full, 30 days">
        <div className={frame}>
          <StatsOverview />
        </div>
      </PreviewSection>

      <PreviewSection title="Events selected, 90 days">
        <div className={frame}>
          <StatsOverview defaultRange="90d" defaultMetric="events" />
        </div>
      </PreviewSection>

      <PreviewSection title="Loading">
        <div className={frame}>
          <StatsOverview loading />
        </div>
      </PreviewSection>

      <PreviewSection title="Error">
        <div className={frame}>
          <StatsOverview error onRetry={() => {}} />
        </div>
      </PreviewSection>

      <PreviewSection title="No data yet">
        <div className={frame}>
          <StatsOverview metrics={everyRange(emptyMetrics)} topEvents={everyRange([])} />
        </div>
      </PreviewSection>

      <PreviewSection title="No metrics">
        <div className={frame}>
          <StatsOverview metrics={everyRange([])} topEvents={everyRange([])} />
        </div>
      </PreviewSection>

      <PreviewSection title="Long labels and extreme values, 7 days">
        <div className={frame}>
          <StatsOverview defaultRange="7d" metrics={everyRange(longMetrics)} topEvents={everyRange(longEvents)} />
        </div>
      </PreviewSection>

      <PreviewSection title="In a narrow container">
        <div className={`${frame} max-w-sm`}>
          <StatsOverview />
        </div>
      </PreviewSection>
    </PreviewStack>
  );
}
