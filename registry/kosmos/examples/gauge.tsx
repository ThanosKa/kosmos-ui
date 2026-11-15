'use client';

import * as React from 'react';
import { PreviewSection, PreviewStack } from '@/components/preview/preview-section';
import { StateMatrix } from '@/components/preview/state-matrix';
import { Button } from '@/registry/kosmos/ui/button';
import { Gauge } from '@/registry/kosmos/ui/gauge';

const tones = ['primary', 'success', 'warning', 'destructive'] as const;
const sizes = ['xs', 'sm', 'md', 'lg'] as const;
const values = ['0', '5', '50', '100'] as const;

export default function GaugePreview() {
  const [value, setValue] = React.useState(35);
  return (
    <PreviewStack>
      {sizes.map((size) => (
        <PreviewSection key={size} title={`${size}: tone × value`}>
          <StateMatrix
            rows={tones}
            states={values}
            render={(tone, state) => (
              <Gauge size={size} tone={tone} value={Number(state)} showValue aria-label={`${tone} ${state}`} />
            )}
          />
        </PreviewSection>
      ))}

      <PreviewSection title="Auto tone: more is better, then less is better">
        <div className="flex flex-wrap items-center gap-8">
          {[12, 48, 91].map((v) => (
            <Gauge key={v} value={v} tone="auto" showValue aria-label={`Score ${v}`} />
          ))}
          {[12, 48, 91].map((v) => (
            <Gauge key={`o${v}`} value={v} tone="auto" optimum={0} showValue aria-label={`Used ${v}`} />
          ))}
        </div>
      </PreviewSection>

      <PreviewSection title="Indeterminate, no label, icon-free, custom range">
        <div className="flex flex-wrap items-center gap-8">
          {sizes.map((size) => (
            <Gauge key={size} size={size} indeterminate aria-label="Calculating" />
          ))}
          <Gauge value={60} aria-label="No visible value" />
          <Gauge value={3} max={5} format={{ style: 'decimal' }} showValue aria-label="3 of 5" />
          <Gauge value={1234} max={1000} showValue size="lg" aria-label="Over the range" />
        </div>
      </PreviewSection>

      <PreviewSection title="Value change">
        <div className="flex items-center gap-6">
          <Gauge value={value} tone="auto" showValue size="lg" aria-label="Interactive" />
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setValue((v) => Math.max(0, v - 25))}>
              Less
            </Button>
            <Button variant="secondary" onClick={() => setValue((v) => Math.min(100, v + 25))}>
              More
            </Button>
          </div>
        </div>
      </PreviewSection>

      <PreviewSection title="In a card">
        <div className="flex max-w-xs items-center gap-4 rounded-2xl border border-transparent bg-card p-4 shadow-card">
          <Gauge value={82} tone="auto" showValue aria-label="Lead score" />
          <div className="min-w-0">
            <p className="truncate text-body font-medium">Lead score</p>
            <p className="text-small text-muted-foreground">Up 6 points since last week</p>
          </div>
        </div>
      </PreviewSection>
    </PreviewStack>
  );
}
