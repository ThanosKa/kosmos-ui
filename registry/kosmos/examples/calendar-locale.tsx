'use client';

import * as React from 'react';
import { Calendar } from '@/registry/kosmos/ui/calendar';

export default function CalendarLocale() {
  const [date, setDate] = React.useState<Date | null>(null);
  return (
    <div className="rounded-2xl border border-transparent bg-card p-4 shadow-card">
      <Calendar
        value={date}
        onValueChange={setDate}
        locale="de-DE"
        previousMonthLabel="Vorheriger Monat"
        nextMonthLabel="Nächster Monat"
        aria-label="Liefertermin"
      />
    </div>
  );
}
