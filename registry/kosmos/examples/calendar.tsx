'use client';

import * as React from 'react';
import { PreviewSection, PreviewStack } from '@/components/preview/preview-section';
import type { DateRange } from '@/registry/kosmos/lib/dates';
import { Calendar, type CalendarProps } from '@/registry/kosmos/ui/calendar';

const day = (month: number, date: number) => new Date(2026, month - 1, date);
const october = day(10, 1);
const isWeekend = (date: Date) => date.getDay() === 0 || date.getDay() === 6;

function Case({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <figure className="flex min-w-0 flex-col gap-2">
      <figcaption className="font-mono text-caption text-muted-foreground">{label}</figcaption>
      <div className="w-fit max-w-full rounded-2xl border border-transparent bg-card p-4 shadow-card">{children}</div>
    </figure>
  );
}

/** Keeps its own value, so each case can still be clicked through. */
function Live(props: CalendarProps) {
  const [value, setValue] = React.useState(props.defaultValue ?? null);
  return props.mode === 'range' ? (
    <Calendar {...props} value={value as DateRange | null} onValueChange={setValue} />
  ) : (
    <Calendar {...props} value={value as Date | null} onValueChange={setValue} />
  );
}

export default function CalendarPreview() {
  return (
    <PreviewStack>
      <PreviewSection title="Single">
        <div className="flex flex-wrap gap-6">
          <Case label="picked, today marked">
            <Live defaultMonth={october} defaultValue={day(10, 14)} aria-label="Due date" />
          </Case>
          <Case label="nothing picked">
            <Live defaultMonth={october} aria-label="Due date" />
          </Case>
          <Case label="min, max, weekends off">
            <Live
              defaultMonth={october}
              defaultValue={day(10, 14)}
              min={day(10, 6)}
              max={day(10, 28)}
              isDateDisabled={isWeekend}
              aria-label="Call date"
            />
          </Case>
        </div>
      </PreviewSection>

      <PreviewSection title="Range">
        <div className="flex flex-wrap gap-6">
          <Case label="two months, across weeks and months">
            <Live mode="range" months={2} defaultMonth={october} defaultValue={{ from: day(10, 20), to: day(11, 6) }} aria-label="Trip" />
          </Case>
          <Case label="first day picked">
            <Live mode="range" defaultMonth={october} defaultValue={{ from: day(10, 9) }} aria-label="Trip" />
          </Case>
          <Case label="one day">
            <Live mode="range" defaultMonth={october} defaultValue={{ from: day(10, 14), to: day(10, 14) }} aria-label="Trip" />
          </Case>
          <Case label="a week, start to end of row">
            <Live mode="range" defaultMonth={october} defaultValue={{ from: day(10, 12), to: day(10, 18) }} aria-label="Trip" />
          </Case>
        </div>
      </PreviewSection>

      <PreviewSection title="Locales">
        <div className="flex flex-wrap gap-6">
          <Case label="en-US, week from Sunday">
            <Live defaultMonth={october} defaultValue={day(10, 14)} locale="en-US" aria-label="Due date" />
          </Case>
          <Case label="el, long month names">
            <Live defaultMonth={day(9, 1)} defaultValue={day(9, 14)} locale="el" aria-label="Προθεσμία" />
          </Case>
        </div>
      </PreviewSection>

      <PreviewSection title="Narrow, 320px">
        <div className="w-80 max-w-full">
          <Case label="two months wrap">
            <Live mode="range" months={2} defaultMonth={october} defaultValue={{ from: day(10, 26), to: day(11, 3) }} aria-label="Trip" />
          </Case>
        </div>
      </PreviewSection>
    </PreviewStack>
  );
}
