'use client';

import { PreviewSection, PreviewStack } from '@/components/preview/preview-section';
import { StatsOverview, type Stat } from '@/registry/kosmos/blocks/stats-overview/stats-overview';

const emptyStats: Stat[] = [
  { id: 'mrr', label: 'Monthly revenue', value: 0, format: 'currency', trend: [] },
  { id: 'accounts', label: 'New accounts', value: 0, format: 'number', trend: [] },
  { id: 'churn', label: 'Churn rate', value: 0, format: 'percent', goodWhen: 'down', trend: [] },
  { id: 'nrr', label: 'Net retention', value: 0, format: 'percent', trend: [] },
];

const longStats: Stat[] = [
  { id: 'arr', label: 'Annual recurring revenue across every region and currency', value: 128_450_920, format: 'currency', change: 1240.5, trend: [1, 3, 2, 8, 12, 30, 44, 61, 90, 128] },
  { id: 'seats', label: 'Seats', value: 3, format: 'number', change: -66.7, trend: [9, 9, 3] },
  { id: 'churn', label: 'Churn rate', value: 0.1, format: 'percent', change: 0.1, goodWhen: 'down', trend: [0, 0, 0.1] },
  { id: 'nrr', label: 'Net retention', value: 100, format: 'percent', change: 0, trend: [100, 100, 100] },
];

export default function StatsOverviewPreview() {
  return (
    <PreviewStack>
      <PreviewSection title="Full, 12 months">
        <StatsOverview />
      </PreviewSection>

      <PreviewSection title="30 days">
        <StatsOverview defaultRange="30d" />
      </PreviewSection>

      <PreviewSection title="Loading">
        <StatsOverview loading />
      </PreviewSection>

      <PreviewSection title="No data yet">
        <StatsOverview stats={emptyStats} revenue={{ '30d': [], '90d': [], '12m': [] }} />
      </PreviewSection>

      <PreviewSection title="Long labels and extreme values">
        <StatsOverview stats={longStats} />
      </PreviewSection>

      <PreviewSection title="In a narrow container">
        <div className="w-full max-w-sm">
          <StatsOverview />
        </div>
      </PreviewSection>
    </PreviewStack>
  );
}
