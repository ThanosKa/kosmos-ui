'use client';

import * as React from 'react';
import { addDays, lastDays, rangeLength, startOfDay } from '@/registry/kosmos/lib/dates';
import { GrowthChart, type ChartConfig } from '@/registry/kosmos/ui/chart';
import {
  ChartCard,
  ChartCardAction,
  ChartCardContent,
  ChartCardDescription,
  ChartCardHeader,
  ChartCardTitle,
} from '@/registry/kosmos/ui/chart-card';
import { DateRangePicker, type DateRangeValue } from '@/registry/kosmos/ui/date-picker';

const dayLabel = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' });
const count = new Intl.NumberFormat('en-US');
const config = { signups: { label: 'Sign-ups', color: 'var(--chart-1)' } } satisfies ChartConfig;

/** Sign-ups a day across the range, with a steady wobble so the same day always draws the same value. */
function points(range: DateRangeValue) {
  const { from } = range;
  return Array.from({ length: rangeLength(range) }, (_, i) => {
    const date = addDays(from, i);
    const seed = date.getFullYear() * 400 + date.getMonth() * 31 + date.getDate();
    return { day: dayLabel.format(date), signups: Math.round(420 + 18 * Math.sin(seed * 0.7) + 4 * i) };
  });
}

export default function DatePickerChartCard() {
  const [range, setRange] = React.useState<DateRangeValue>(() => lastDays(30));
  const total = points(range).reduce((sum, point) => sum + point.signups, 0);
  return (
    <ChartCard className="w-full max-w-2xl">
      <ChartCardHeader>
        <ChartCardTitle render={<h2 />}>Sign-ups</ChartCardTitle>
        <ChartCardDescription>{count.format(total)} in the period</ChartCardDescription>
        <ChartCardAction>
          <DateRangePicker aria-label="Period" value={range} onValueChange={setRange} max={startOfDay(new Date())} align="end" className="h-7.5" />
        </ChartCardAction>
      </ChartCardHeader>
      <ChartCardContent>
        <GrowthChart
          title="Sign-ups a day in the period"
          data={points(range)}
          config={config}
          xKey="day"
          xLabel="Day"
          valueFormatter={(value) => count.format(value)}
        />
      </ChartCardContent>
    </ChartCard>
  );
}
