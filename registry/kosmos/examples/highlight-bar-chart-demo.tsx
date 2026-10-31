'use client';

import * as React from 'react';
import { useChartEntrance, useCountUp } from '@/registry/kosmos/hooks/use-chart-motion';
import { ChartCard, ChartCardAction, ChartCardContent, ChartCardHeader, ChartCardTitle } from '@/registry/kosmos/ui/chart-card';
import { HighlightBarChart, type HighlightBarChartItem } from '@/registry/kosmos/ui/highlight-bar-chart';
import { SegmentedControl, SegmentedControlItem } from '@/registry/kosmos/ui/segmented-control';
import { StatCardDelta } from '@/registry/kosmos/ui/stat-card';

const DAY = 86_400_000;
const weekday = new Intl.DateTimeFormat('en-US', { weekday: 'short', timeZone: 'UTC' });
const monthDay = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
const fullDay = new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC' });
const compact = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 2 });

/** Each value is the day or week that ends on October 11, 2026, oldest first. */
function bars(values: number[], step: number, label: (date: number) => string, name: (date: number) => string): HighlightBarChartItem[] {
  const last = Date.UTC(2026, 9, step === DAY ? 11 : 5);
  return values.map((value, i) => {
    const date = last - (values.length - 1 - i) * step;
    return { label: label(date), name: name(date), value };
  });
}

const ranges = {
  '7d': {
    label: 'Last 7 days',
    against: 'vs the 7 days before',
    change: 2.4,
    bars: bars([962400, 978100, 991500, 953800, 969700, 971300, 1012000], DAY, weekday.format, fullDay.format),
  },
  '30d': {
    label: 'Last 30 days',
    against: 'vs the 30 days before',
    change: 14.2,
    bars: bars(
      [
        896600, 881200, 901500, 896700, 917100, 901300, 915500, 926100, 910100, 930900, 925800, 946700, 930300, 944800, 955600, 939000,
        960300, 954900, 976400, 959300, 974100, 985200, 967800, 989700, 984000, 1006000, 988300, 1003400, 1014600, 1012000,
      ],
      DAY,
      monthDay.format,
      fullDay.format,
    ),
  },
  '90d': {
    label: 'Last 90 days',
    against: 'vs the 90 days before',
    change: 31.8,
    bars: bars(
      [6409100, 6391700, 6541700, 6568300, 6707100, 6773200, 6750800, 6905100, 6929200, 7071600, 7137400, 7109900, 7040000],
      7 * DAY,
      monthDay.format,
      (date) => `Week of ${monthDay.format(date)}`,
    ),
  },
} satisfies Record<string, { label: string; against: string; change: number; bars: HighlightBarChartItem[] }>;

type Range = keyof typeof ranges;

export default function HighlightBarChartDemo() {
  const card = React.useRef<HTMLDivElement>(null);
  const [range, setRange] = React.useState<Range>('7d');
  const { label, against, change, bars } = ranges[range];
  const total = bars.reduce((sum, bar) => sum + bar.value, 0);
  const { revealed, instant } = useChartEntrance(card);
  const shownTotal = useCountUp(total, { ready: revealed, instant });

  return (
    <ChartCard ref={card} className="w-full max-w-4xl">
      <ChartCardHeader>
        <ChartCardTitle render={<h3 />}>Events</ChartCardTitle>
        <ChartCardAction>
          <SegmentedControl size="sm" value={range} onValueChange={(value) => setRange(value as Range)} aria-label="Range">
            <SegmentedControlItem value="7d">7 days</SegmentedControlItem>
            <SegmentedControlItem value="30d">30 days</SegmentedControlItem>
            <SegmentedControlItem value="90d">90 days</SegmentedControlItem>
          </SegmentedControl>
        </ChartCardAction>
        <div className="col-span-full mt-2 flex flex-col gap-1">
          <p className="text-display tabular-nums">
            <span aria-hidden>{compact.format(shownTotal)}</span>
            <span className="sr-only">{compact.format(total)}</span>
          </p>
          <StatCardDelta value={change}>{against}</StatCardDelta>
        </div>
      </ChartCardHeader>
      <ChartCardContent className="min-h-0">
        <HighlightBarChart data={bars} label={`Events, ${label.toLowerCase()}`} />
      </ChartCardContent>
    </ChartCard>
  );
}
