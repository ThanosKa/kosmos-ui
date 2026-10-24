'use client';

import { StatCard, StatCardDelta, StatCardLabel, StatCardSparkline, StatCardValue } from '@/registry/kosmos/ui/stat-card';

const trend = (values: number[]) => values.map((value) => ({ value }));

const stats = [
  {
    label: 'Active users',
    value: '144,600',
    change: 9.6,
    data: trend([26800, 27100, 26900, 27600, 27400, 28100, 28300, 28000, 28700, 29100, 28900, 29400]),
  },
  {
    label: 'Events',
    value: '28.5M',
    change: 14.2,
    data: trend([880, 902, 915, 940, 921, 958, 990, 1004, 978, 1012, 996, 1012]),
  },
  {
    label: 'Live projects',
    value: '8',
    change: -11.1,
    data: trend([9, 9, 9, 9, 9, 9, 8, 8, 8, 8, 8, 8]),
  },
];

export default function StatCardDemo() {
  return (
    <div className="grid w-full max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3">
      {stats.map((stat) => (
        <StatCard key={stat.label}>
          <StatCardLabel>{stat.label}</StatCardLabel>
          <StatCardValue>{stat.value}</StatCardValue>
          <StatCardDelta value={stat.change}>vs September</StatCardDelta>
          <StatCardSparkline
            data={stat.data}
            aria-label={`${stat.label}, last 30 days, ${stat.change > 0 ? 'up' : 'down'} ${Math.abs(stat.change)}%`}
          />
        </StatCard>
      ))}
    </div>
  );
}
