'use client';

import * as React from 'react';
import { addDays, startOfDay } from '@/registry/kosmos/lib/dates';
import { Calendar } from '@/registry/kosmos/ui/calendar';

const isWeekend = (date: Date) => date.getDay() === 0 || date.getDay() === 6;

export default function CalendarLimits() {
  const [today] = React.useState(() => startOfDay(new Date()));
  const [date, setDate] = React.useState<Date | null>(null);
  return (
    <div className="rounded-2xl border border-transparent bg-card p-4 shadow-card">
      <Calendar
        value={date}
        onValueChange={setDate}
        min={today}
        max={addDays(today, 45)}
        isDateDisabled={isWeekend}
        aria-label="Call date"
      />
    </div>
  );
}
