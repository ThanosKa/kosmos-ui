'use client';

import { PreviewSection, PreviewStack } from '@/components/preview/preview-section';
import { UsageOverview, type UsageDataset, type UsageRange } from '@/registry/kosmos/blocks/usage-overview/usage-overview';

const frame = 'w-full rounded-xl border border-transparent bg-background p-4 shadow-card';

const emptyDataset: UsageDataset = {
  periodLabel: 'Sep 14 – Oct 13',
  totals: { tokens: 0, runs: 0, costUsd: 0, changePct: { tokens: 0, runs: 0, costUsd: 0 } },
  daily: [],
  models: [],
  members: [],
};
const longRows = [
  { id: 'sonnet', name: 'Claude Sonnet 5.5 for the support inbox triage agent', runs: 1_284_310, tokens: 18_204_550_000, costUsd: 327_681.9 },
  { id: 'haiku', name: 'Claude Haiku 5.5', runs: 9, tokens: 4_100, costUsd: 0.01 },
];
const longDataset: UsageDataset = {
  periodLabel: 'Oct 7 – Oct 13',
  totals: { tokens: 18_204_554_100, runs: 1_284_319, costUsd: 327_681.91, changePct: { tokens: 1240.5, runs: -66.7, costUsd: 0 } },
  daily: ['Oct 7', 'Oct 8', 'Oct 9', 'Oct 10', 'Oct 11', 'Oct 12', 'Oct 13'].map((date, index) => ({
    date,
    sonnet: 2_600_000_000 + index * 1_000_000,
    haiku: index === 6 ? 4_100 : 0,
  })),
  models: longRows,
  members: [{ id: 'growth', name: 'Growth team, Europe and Middle East', runs: 1_284_319, tokens: 18_204_554_100, costUsd: 327_681.91 }],
};
const longUsage: Record<UsageRange, UsageDataset> = { '7d': longDataset, '30d': longDataset, '90d': longDataset };

const emptyUsage: Record<UsageRange, UsageDataset> = { '7d': emptyDataset, '30d': emptyDataset, '90d': emptyDataset };

export default function UsageOverviewPreview() {
  return (
    <PreviewStack>
      <PreviewSection title="Full, 30 days">
        <div className={frame}>
          <UsageOverview />
        </div>
      </PreviewSection>

      <PreviewSection title="7 days, by member">
        <div className={frame}>
          <UsageOverview defaultRange="7d" defaultBreakdown="member" />
        </div>
      </PreviewSection>

      <PreviewSection title="Loading">
        <div className={frame}>
          <UsageOverview loading />
        </div>
      </PreviewSection>

      <PreviewSection title="No runs in the period">
        <div className={frame}>
          <UsageOverview usage={emptyUsage} />
        </div>
      </PreviewSection>

      <PreviewSection title="Long names and extreme values, over budget">
        <div className={frame}>
          <UsageOverview
            workspace="Acme Inc. Research and Development, Europe and Middle East"
            usage={longUsage}
            defaultRange="7d"
            budget={{ usedUsd: 327_681.91, limitUsd: 250_000 }}
          />
        </div>
      </PreviewSection>

      <PreviewSection title="In a narrow container, budget at 92%">
        <div className={`${frame} max-w-sm`}>
          <UsageOverview defaultRange="90d" defaultBreakdown="member" budget={{ usedUsd: 1380, limitUsd: 1500 }} />
        </div>
      </PreviewSection>
    </PreviewStack>
  );
}
