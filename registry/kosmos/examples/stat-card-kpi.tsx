'use client';

import { Activity, CircleDollarSign, FolderOpen, Users } from 'lucide-react';
import {
  StatCard,
  StatCardContent,
  StatCardDelta,
  StatCardEyebrow,
  StatCardHeader,
  StatCardIcon,
  StatCardLabel,
  StatCardSparkline,
  StatCardValue,
} from '@/registry/kosmos/ui/stat-card';

const trend = (values: number[]) => values.map((value) => ({ value }));

const kpis = [
  {
    icon: Users,
    eyebrow: 'Web and apps',
    label: 'Active users',
    value: '144,600',
    change: 9.6,
    context: '(+12,666)',
    data: trend([26800, 27100, 26900, 27600, 27400, 28100, 28300, 28000, 28700, 29100, 28900, 29400]),
  },
  {
    icon: Activity,
    eyebrow: 'Every project',
    label: 'Events',
    value: '28.5M',
    change: 14.2,
    context: '(+3.5M)',
    data: trend([880, 902, 915, 940, 921, 958, 990, 1004, 978, 1012, 996, 1012]),
  },
  {
    icon: CircleDollarSign,
    eyebrow: 'Pro and Scale',
    label: 'Monthly revenue',
    value: '$14,628',
    change: 6.8,
    context: '(+$931)',
    data: trend([13700, 13700, 13850, 13850, 14100, 14100, 14280, 14280, 14480, 14480, 14628, 14628]),
  },
  {
    icon: FolderOpen,
    eyebrow: 'Of 12 projects',
    label: 'Live projects',
    value: '8',
    change: -11.1,
    context: '(−1)',
    data: trend([9, 9, 9, 9, 9, 9, 8, 8, 8, 8, 8, 8]),
  },
];

export default function StatCardKpi() {
  return (
    <div className="@container w-full">
      <div className="grid grid-cols-1 gap-4 @lg:grid-cols-2 @5xl:grid-cols-4">
        {kpis.map(({ icon: Icon, ...kpi }) => (
          <StatCard key={kpi.label}>
            <StatCardHeader>
              <StatCardIcon>
                <Icon />
              </StatCardIcon>
              <StatCardEyebrow>{kpi.eyebrow}</StatCardEyebrow>
              <StatCardLabel>{kpi.label}</StatCardLabel>
            </StatCardHeader>
            <StatCardContent>
              <StatCardValue>{kpi.value}</StatCardValue>
              <StatCardDelta value={kpi.change}>{kpi.context}</StatCardDelta>
              <StatCardSparkline
                data={kpi.data}
                aria-label={`${kpi.label}, last 30 days, ${kpi.change > 0 ? 'up' : 'down'} ${Math.abs(kpi.change)}%`}
              />
            </StatCardContent>
          </StatCard>
        ))}
      </div>
    </div>
  );
}
