'use client';

import * as React from 'react';
import { addDays, lastDays, type DateRange } from '@/registry/kosmos/lib/dates';
import { Calendar } from '@/registry/kosmos/ui/calendar';

export default function CalendarRange() {
  const [range, setRange] = React.useState<DateRange | null>(() => {
    const { from } = lastDays(7);
    return { from, to: addDays(from, 9) };
  });
  return (
    <div className="rounded-2xl border border-transparent bg-card p-4 shadow-card">
      <Calendar mode="range" months={2} value={range} onValueChange={setRange} aria-label="Trip dates" />
    </div>
  );
}
