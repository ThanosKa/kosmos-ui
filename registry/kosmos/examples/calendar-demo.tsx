'use client';

import * as React from 'react';
import { Calendar } from '@/registry/kosmos/ui/calendar';

export default function CalendarDemo() {
  const [date, setDate] = React.useState<Date | null>(() => new Date());
  return (
    <div className="rounded-2xl border border-transparent bg-card p-4 shadow-card">
      <Calendar value={date} onValueChange={setDate} aria-label="Due date" />
    </div>
  );
}
