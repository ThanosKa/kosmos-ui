'use client';

import { Sparkline } from '@/registry/kosmos/ui/chart';

const signups = [30, 42, 38, 51, 47, 60, 58, 64, 70, 66, 74, 81].map((value) => ({ value }));

export default function ChartSparkline() {
  return (
    <div className="flex w-full max-w-xs items-end justify-between gap-4 rounded-2xl border border-transparent bg-card p-4 shadow-card">
      <div className="flex flex-col gap-1">
        <span className="text-body font-medium text-muted-foreground">Signups</span>
        <span className="text-display tabular-nums">1,284</span>
        <span className="text-small text-muted-foreground tabular-nums">+4.2% vs last month</span>
      </div>
      <Sparkline data={signups} aria-label="Signups, last 12 months, up 4.2%" className="h-10 w-24" />
    </div>
  );
}
