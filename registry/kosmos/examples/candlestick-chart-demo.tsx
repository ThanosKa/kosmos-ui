'use client';

import { Activity } from 'lucide-react';
import * as React from 'react';
import { useChartEntrance, useCountUp } from '@/registry/kosmos/hooks/use-chart-motion';
import { cn } from '@/registry/kosmos/lib/cn';
import { CandlestickChart, type CandlestickChartItem } from '@/registry/kosmos/ui/candlestick-chart';
import { ChartCard, ChartCardAction, ChartCardContent, ChartCardHeader, ChartCardTitle } from '@/registry/kosmos/ui/chart-card';
import { SegmentedControl, SegmentedControlItem } from '@/registry/kosmos/ui/segmented-control';
import { StatCardDelta } from '@/registry/kosmos/ui/stat-card';

const HOUR = 3_600_000;
const DAY = 24 * HOUR;
const weekday = new Intl.DateTimeFormat('en-US', { weekday: 'short', timeZone: 'UTC' });
const monthDay = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
const month = new Intl.DateTimeFormat('en-US', { month: 'short', timeZone: 'UTC' });
const fullDay = new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC' });
const clock = new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZone: 'UTC' });
const compact = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 2 });

/** A fixed sequence between -1 and 1, so the server and every browser draw the same candles. */
function wobble(seed: number) {
  let state = seed;
  return () => {
    state = (state * 16807) % 2147483647;
    return (state / 2147483647) * 2 - 1;
  };
}

/**
 * Candles of events a minute. Each run of `minutes` takes its events from `volumes`: the close is that run's average
 * rate give or take a little, the open is the close before it, and the wick reaches the busiest and quietest minute.
 */
function candles(
  volumes: number[],
  minutes: number,
  start: number,
  step: number,
  time: (date: number) => Pick<CandlestickChartItem, 'label' | 'name' | 'group'>,
): CandlestickChartItem[] {
  const next = wobble(volumes.length * 31);
  let close = Math.round((volumes[0] / minutes) * 0.98);
  return volumes.map((volume, i) => {
    const open = close;
    close = Math.round((volume / minutes) * (1 + next() * 0.03));
    return {
      ...time(start + i * step),
      open,
      close,
      high: Math.round(Math.max(open, close) * (1 + Math.abs(next()) * 0.05)),
      low: Math.round(Math.min(open, close) * (1 - Math.abs(next()) * 0.05)),
      volume,
    };
  });
}

/** How a day's events spread over its eight 3-hour runs (UTC): customers on every continent keep the night busy. */
const dayShape = [0.11, 0.1, 0.12, 0.13, 0.14, 0.14, 0.13, 0.13];
const week = [962400, 978100, 991500, 953800, 969700, 971300, 1012000];
const threeHours = week.flatMap((day) => {
  const runs = dayShape.map((share) => Math.round(day * share));
  runs[runs.length - 1] += day - runs.reduce((sum, run) => sum + run, 0);
  return runs;
});

const ranges = {
  '7d': {
    label: 'Last 7 days',
    against: 'vs the 7 days before',
    change: 2.4,
    candles: candles(threeHours, 180, Date.UTC(2026, 9, 5), 3 * HOUR, (date) => ({
      label: `${weekday.format(date)} ${clock.format(date)}`,
      name: `${fullDay.format(date)}, ${clock.format(date)} to ${clock.format(date + 3 * HOUR)}`,
      group: weekday.format(date),
    })),
  },
  '30d': {
    label: 'Last 30 days',
    against: 'vs the 30 days before',
    change: 14.2,
    candles: candles(
      [
        896600, 881200, 901500, 896700, 917100, 901300, 915500, 926100, 910100, 930900, 925800, 946700, 930300, 944800, 955600, 939000,
        960300, 954900, 976400, 959300, 974100, 985200, 967800, 989700, 984000, 1006000, 988300, 1003400, 1014600, 1012000,
      ],
      24 * 60,
      Date.UTC(2026, 8, 12),
      DAY,
      (date) => {
        const monday = date - ((new Date(date).getUTCDay() + 6) % 7) * DAY;
        return { label: monthDay.format(date), name: fullDay.format(date), group: monthDay.format(monday) };
      },
    ),
  },
  '90d': {
    label: 'Last 90 days',
    against: 'vs the 90 days before',
    change: 31.8,
    candles: candles(
      [6409100, 6391700, 6541700, 6568300, 6707100, 6773200, 6750800, 6905100, 6929200, 7071600, 7137400, 7109900, 7040000],
      7 * 24 * 60,
      Date.UTC(2026, 6, 13),
      7 * DAY,
      (date) => ({ label: monthDay.format(date), name: `Week of ${monthDay.format(date)}`, group: month.format(date) }),
    ),
  },
} satisfies Record<string, { label: string; against: string; change: number; candles: CandlestickChartItem[] }>;

type Range = keyof typeof ranges;

export default function CandlestickChartDemo() {
  const card = React.useRef<HTMLDivElement>(null);
  const { revealed, instant } = useChartEntrance(card);
  const [range, setRange] = React.useState<Range>('7d');
  const { label, against, change, candles } = ranges[range];
  const total = candles.reduce((sum, candle) => sum + (candle.volume ?? 0), 0);
  const shownTotal = useCountUp(total, { ready: revealed, instant });

  return (
    <ChartCard ref={card} data-instant={instant || undefined} className="w-full max-w-4xl data-instant:**:transition-none">
      <ChartCardHeader>
        <ChartCardTitle
          render={<h3 />}
          className={cn('flex items-center gap-2 transition-[opacity] duration-base ease-power3-out', !revealed && 'opacity-0')}
        >
          <span aria-hidden className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Activity className="size-3.5" />
          </span>
          Events a minute
        </ChartCardTitle>
        <ChartCardAction
          className={cn(
            'row-start-3 @sm/chart-card:row-start-1',
            'transition-[opacity] delay-100 duration-base ease-power3-out',
            !revealed && 'opacity-0',
          )}
        >
          <SegmentedControl size="sm" value={range} onValueChange={(value) => setRange(value as Range)} aria-label="Range">
            <SegmentedControlItem value="7d">7 days</SegmentedControlItem>
            <SegmentedControlItem value="30d">30 days</SegmentedControlItem>
            <SegmentedControlItem value="90d">90 days</SegmentedControlItem>
          </SegmentedControl>
        </ChartCardAction>
        <div className="col-start-1 row-start-2 mt-2 flex min-w-0 flex-col gap-1">
          <p className="text-display tabular-nums">
            <span aria-hidden>{compact.format(shownTotal)}</span>
            <span className="sr-only">{compact.format(total)} events</span>
          </p>
          <StatCardDelta value={change}>{against}</StatCardDelta>
        </div>
      </ChartCardHeader>
      <ChartCardContent className="min-h-56">
        <CandlestickChart data={candles} label={`Events a minute, ${label.toLowerCase()}`} volumeLabel="Events" />
      </ChartCardContent>
    </ChartCard>
  );
}
