'use client';

import * as React from 'react';
import { lastDays } from '@/registry/kosmos/lib/dates';
import { DateRangePicker, type DateRangeValue } from '@/registry/kosmos/ui/date-picker';

export default function DatePickerRange() {
  const [range, setRange] = React.useState<DateRangeValue | null>(() => lastDays(30));
  return <DateRangePicker aria-label="Period" value={range} onValueChange={setRange} />;
}
