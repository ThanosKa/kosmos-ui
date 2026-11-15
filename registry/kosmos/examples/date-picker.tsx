'use client';

import * as React from 'react';
import { OverlayStage, OverlayStageGrid } from '@/components/preview/overlay-stage';
import { PreviewSection, PreviewStack } from '@/components/preview/preview-section';
import { StateMatrix, previewState } from '@/components/preview/state-matrix';
import { lastDays, startOfDay } from '@/registry/kosmos/lib/dates';
import { Button } from '@/registry/kosmos/ui/button';
import { DatePicker, DateRangePicker } from '@/registry/kosmos/ui/date-picker';

const rows = ['empty', 'a day', 'a quick range', 'a range of dates', 'invalid'] as const;
const day = (month: number, date: number) => new Date(2026, month - 1, date);

const germanRanges = [
  { label: 'Heute', ...lastDays(1, day(10, 25)) },
  { label: 'Letzte 7 Tage', ...lastDays(7, day(10, 25)) },
  { label: 'Letzte 30 Tage', ...lastDays(30, day(10, 25)) },
  { label: 'Seit Beginn des Geschäftsjahres', from: day(4, 1), to: day(10, 25) },
  { label: 'Vorheriges Quartal (Juli bis September)', from: day(7, 1), to: day(9, 30) },
];

function Trigger({ row, state }: { row: (typeof rows)[number]; state: string }) {
  const preview = previewState(state);
  if (row === 'empty') return <DatePicker aria-label="Due date" className="w-full" {...preview} />;
  if (row === 'a day') return <DatePicker aria-label="Due date" defaultValue={day(10, 14)} className="w-full" {...preview} />;
  if (row === 'invalid') return <DatePicker aria-label="Due date" aria-invalid className="w-full" {...preview} />;
  if (row === 'a quick range') return <DateRangePicker aria-label="Period" defaultValue={lastDays(7)} className="w-full" {...preview} />;
  return <DateRangePicker aria-label="Period" defaultValue={{ from: day(10, 3), to: day(11, 9) }} className="w-full" {...preview} />;
}

export default function DatePickerPreview() {
  const [today] = React.useState(() => startOfDay(new Date()));
  return (
    <PreviewStack>
      <PreviewSection title="Trigger">
        <StateMatrix rows={rows} render={(row, state) => <Trigger row={row} state={state} />} />
      </PreviewSection>

      <PreviewSection title="Beside a button, 30px">
        <div className="flex flex-wrap items-center gap-2">
          <DateRangePicker aria-label="Period" defaultValue={lastDays(30)} className="h-7.5 w-48" />
          <Button variant="secondary">Export</Button>
        </div>
      </PreviewSection>

      <PreviewSection title="Long text">
        <div className="flex w-80 max-w-full flex-col gap-3">
          <DatePicker aria-label="Fecha" locale="es-ES" defaultValue={day(9, 30)} className="w-full" />
          <DateRangePicker
            aria-label="Period"
            locale="en-GB"
            ranges={[]}
            defaultValue={{ from: day(12, 28), to: new Date(2027, 0, 11) }}
            className="w-44"
          />
          <DatePicker aria-label="Kickoff" placeholder="Pick the day the quarterly planning kickoff starts" className="w-full" />
        </div>
      </PreviewSection>

      <PreviewSection title="Worst case">
        <OverlayStage label="translated quick ranges, a range across the year" className="h-[40rem] sm:h-[27rem]">
          {(container) => (
            <DateRangePicker
              open
              aria-label="Zeitraum"
              locale="de-DE"
              placeholder="Zeitraum wählen"
              rangesLabel="Schnellauswahl"
              startHint="Ersten oder letzten Tag wählen"
              endHint="Das andere Ende wählen"
              ranges={germanRanges}
              defaultValue={{ from: day(12, 22), to: new Date(2027, 0, 6) }}
              container={container}
            />
          )}
        </OverlayStage>
      </PreviewSection>

      <PreviewSection title="Open">
        <OverlayStageGrid>
          <OverlayStage label="one day" className="h-[25rem]">
            {(container) => (
              <DatePicker open aria-label="Due date" defaultValue={today} container={container} />
            )}
          </OverlayStage>
          <OverlayStage label="min, max, weekends off" className="h-[25rem]">
            {(container) => (
              <DatePicker
                open
                aria-label="Call date"
                defaultValue={day(10, 14)}
                min={day(10, 6)}
                max={day(10, 28)}
                isDateDisabled={(date) => date.getDay() === 0 || date.getDay() === 6}
                container={container}
              />
            )}
          </OverlayStage>
        </OverlayStageGrid>
        <OverlayStage label="range with quick ranges (two months from 640px)" className="h-[36rem] sm:h-[25rem]">
          {(container) => <DateRangePicker open aria-label="Period" defaultValue={lastDays(7)} container={container} />}
        </OverlayStage>
      </PreviewSection>
    </PreviewStack>
  );
}
