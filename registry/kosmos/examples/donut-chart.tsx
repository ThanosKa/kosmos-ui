'use client';

import * as React from 'react';
import { PreviewSection, PreviewStack } from '@/components/preview/preview-section';
import { StateMatrix } from '@/components/preview/state-matrix';
import { Button } from '@/registry/kosmos/ui/button';
import { DonutChart, DonutChartLegend, type DonutChartItem } from '@/registry/kosmos/ui/donut-chart';
import { Gauge } from '@/registry/kosmos/ui/gauge';

const compact = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 });

const sources: DonutChartItem[] = [
  { label: 'Search', value: 15950 },
  { label: 'Direct', value: 10510 },
  { label: 'Referral', value: 6610 },
  { label: 'Social', value: 3890 },
  { label: 'Email', value: 1950 },
];

const datasets = {
  five: sources,
  two: [
    { label: 'Paid', value: 68 },
    { label: 'Free', value: 32 },
  ],
  tiny: [
    { label: 'Chrome', value: 96 },
    { label: 'Safari', value: 2 },
    { label: 'Firefox', value: 1 },
    { label: 'Edge', value: 1 },
  ],
  one: [{ label: 'Search', value: 15950 }],
  zero: [
    { label: 'Search', value: 0 },
    { label: 'Direct', value: 0 },
  ],
} satisfies Record<string, DonutChartItem[]>;

const sizes = ['sm', 'md', 'lg'] as const;
const cases = Object.keys(datasets) as (keyof typeof datasets)[];

export default function DonutChartPreview() {
  const [shift, setShift] = React.useState(0);
  const live = sources.map((source, i) => ({ ...source, value: i === 0 ? source.value + shift : source.value }));

  return (
    <PreviewStack>
      <PreviewSection title="Beside Gauge: same size, same ring">
        <StateMatrix
          rows={sizes}
          states={['gauge', 'donut', 'donut (2 parts)'] as const}
          render={(size, state) =>
            state === 'gauge' ? (
              <Gauge size={size} value={68} showValue aria-label="Gauge 68" />
            ) : (
              <DonutChart size={size} data={state === 'donut' ? sources : datasets.two} label="Visitors" format={compact.format} />
            )
          }
        />
      </PreviewSection>

      <PreviewSection title="Size × data">
        <StateMatrix
          rows={sizes}
          states={cases}
          render={(size, data) => <DonutChart size={size} data={datasets[data]} label="Total" format={compact.format} />}
        />
      </PreviewSection>

      <PreviewSection title="With a legend, side by side and stacked">
        <div className="flex flex-wrap items-start gap-8">
          <div className="flex w-full max-w-sm items-center gap-5 rounded-2xl border border-transparent bg-card p-4 shadow-card">
            <DonutChart data={sources} label="Visitors" format={compact.format} aria-label={`${compact.format(38910)} visitors`} />
            <DonutChartLegend data={sources} format={compact.format} aria-label="Visitors by source" className="flex-1" />
          </div>
          <div className="flex w-full max-w-56 flex-col items-center gap-5 rounded-2xl border border-transparent bg-card p-4 shadow-card">
            <DonutChart data={datasets.tiny} label="Sessions" format={(v) => `${v}%`} />
            <DonutChartLegend data={datasets.tiny} format={(v) => `${v}%`} showShare={false} aria-label="Sessions by browser" className="w-full" />
          </div>
        </div>
      </PreviewSection>

      <PreviewSection title="Custom center, custom colors, long labels">
        <div className="flex flex-wrap items-start gap-8">
          <DonutChart data={datasets.two} aria-label="68% paid">
            <span className="text-title font-medium tabular-nums">68%</span>
            <span className="text-caption text-muted-foreground">paid</span>
          </DonutChart>
          <DonutChart
            data={[
              { label: 'Passed', value: 182, color: 'var(--success)' },
              { label: 'Flaky', value: 12, color: 'var(--warning)' },
              { label: 'Failed', value: 6, color: 'var(--destructive)' },
            ]}
            label="Tests"
          />
          <div className="w-full max-w-64 rounded-2xl border border-transparent bg-card p-4 shadow-card">
            <DonutChartLegend
              aria-label="Long labels"
              data={[
                { label: 'A very long referral source name that will not fit', value: 1240000 },
                { label: 'Συνεργάτες και αναφορές', value: 830000 },
                { label: 'メールマガジン', value: 4 },
              ]}
              format={compact.format}
            />
          </div>
        </div>
      </PreviewSection>

      <PreviewSection title="Worst case: huge totals, a long label, seven parts, repeated and invalid values">
        <div className="flex flex-wrap items-center gap-8">
          {sizes.map((size) => (
            <DonutChart
              key={size}
              size={size}
              data={[
                { label: 'Enterprise', value: 987654321 },
                { label: 'Other', value: 123456789 },
              ]}
              label="Unique visitors across every workspace"
            />
          ))}
          <DonutChart
            data={[
              { label: 'Search', value: 30 },
              { label: 'Direct', value: 20 },
              { label: 'Referral', value: 15 },
              { label: 'Social', value: 12 },
              { label: 'Email', value: 9 },
              { label: 'Other', value: 8 },
              { label: 'Other', value: 6 },
            ]}
            label="Seven parts"
          />
          <DonutChart
            data={[
              { label: 'Refunds', value: -40 },
              { label: 'Unknown', value: Number.NaN },
              { label: 'Sales', value: 120 },
            ]}
            label="Invalid"
          />
        </div>
      </PreviewSection>

      <PreviewSection title="Value change">
        <div className="flex items-center gap-6">
          <DonutChart data={live} label="Visitors" format={compact.format} />
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setShift((s) => Math.max(-15000, s - 10000))}>
              Less search
            </Button>
            <Button variant="secondary" onClick={() => setShift((s) => s + 10000)}>
              More search
            </Button>
          </div>
        </div>
      </PreviewSection>
    </PreviewStack>
  );
}
