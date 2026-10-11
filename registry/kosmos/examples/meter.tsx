'use client';

import { PreviewSection, PreviewStack } from '@/components/preview/preview-section';
import { StateMatrix } from '@/components/preview/state-matrix';
import { Meter, MeterBar, MeterLabel, MeterSegments, MeterValue } from '@/registry/kosmos/ui/meter';

const tones = ['primary', 'success', 'warning', 'destructive'] as const;
const values = ['0', '5', '50', '100'] as const;
const autoValues = [12, 48, 91] as const;

export default function MeterPreview() {
  return (
    <PreviewStack>
      <PreviewSection title="Segments: tone × value">
        <StateMatrix
          rows={tones}
          states={values}
          render={(tone, value) => (
            <Meter value={Number(value)} tone={tone} className="w-full">
              <MeterLabel>Score</MeterLabel>
              <MeterValue />
              <MeterSegments />
            </Meter>
          )}
        />
      </PreviewSection>

      <PreviewSection title="Bar: tone × value">
        <StateMatrix
          rows={tones}
          states={values}
          render={(tone, value) => (
            <Meter value={Number(value)} tone={tone} className="w-full">
              <MeterLabel>Score</MeterLabel>
              <MeterValue />
              <MeterBar />
            </Meter>
          )}
        />
      </PreviewSection>

      <PreviewSection title="Auto tone: more is better, then less is better">
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="flex flex-col gap-4">
            {autoValues.map((value) => (
              <Meter key={value} value={value} tone="auto">
                <MeterLabel>Health score</MeterLabel>
                <MeterValue>{(_, raw) => `${raw} / 100`}</MeterValue>
                <MeterSegments />
              </Meter>
            ))}
          </div>
          <div className="flex flex-col gap-4">
            {autoValues.map((value) => (
              <Meter
                key={value}
                value={(value / 100) * 50}
                max={50}
                optimum={0}
                tone="auto"
                format={{ style: 'unit', unit: 'gigabyte', maximumFractionDigits: 1 }}
              >
                <MeterLabel>Storage used</MeterLabel>
                <MeterValue>{(formatted) => `${formatted} of 50 GB`}</MeterValue>
                <MeterBar />
              </Meter>
            ))}
          </div>
        </div>
      </PreviewSection>

      <PreviewSection title="Segment counts and a long label">
        <div className="flex max-w-sm flex-col gap-4">
          <Meter value={60} tone="primary">
            <MeterLabel>10 segments</MeterLabel>
            <MeterValue />
            <MeterSegments count={10} />
          </Meter>
          <Meter value={60} tone="primary">
            <MeterLabel>40 segments</MeterLabel>
            <MeterValue />
            <MeterSegments count={40} />
          </Meter>
          <Meter value={73} tone="primary">
            <MeterLabel>Monthly active seats across every workspace in the organization</MeterLabel>
            <MeterValue />
            <MeterBar />
          </Meter>
        </div>
      </PreviewSection>

      <PreviewSection title="In a card, no visible label">
        <div className="flex max-w-xs flex-col gap-3 rounded-2xl border border-transparent bg-card p-4 shadow-card">
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-body font-medium">Lead score</span>
            <span className="text-display tabular-nums">82</span>
          </div>
          <Meter value={82} tone="auto" aria-label="Lead score">
            <MeterSegments />
          </Meter>
        </div>
      </PreviewSection>
    </PreviewStack>
  );
}
