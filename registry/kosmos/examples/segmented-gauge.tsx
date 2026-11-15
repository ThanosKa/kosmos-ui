'use client';

import { PreviewSection, PreviewStack } from '@/components/preview/preview-section';
import SegmentedGaugeDemo from '@/registry/kosmos/examples/segmented-gauge-demo';
import { SegmentedGauge, type SegmentedGaugeProps } from '@/registry/kosmos/ui/segmented-gauge';

const compact = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 2 });

const cases: { title: string; props: Omit<SegmentedGaugeProps, 'label'> }[] = [
  { title: 'Fernhill Books, 49%', props: { value: 3_912_400, max: 8_000_000, caption: 'Last 30 days', description: '51% left' } },
  { title: 'Cirrus Weather, near the limit', props: { value: 2_391_700, max: 3_000_000, high: 2_250_000, caption: 'Last 30 days', description: '20% left' } },
  { title: 'Copperline Bank, past the limit', props: { value: 8_730_100, max: 8_000_000, caption: 'Last 30 days', description: '9% over the allowance' } },
  { title: 'Marigold Recipes, 2%: one segment lit', props: { value: 74_500, max: 3_000_000, description: '98% left' } },
  { title: 'Nothing used', props: { value: 0, max: 50_000, caption: 'Last 30 days', description: 'No events yet' } },
  { title: 'No limit (max 0)', props: { value: 2_400, max: 0 } },
  {
    title: 'Long lines and a huge value',
    props: {
      value: 8_730_100_000,
      max: 8_000_000_000,
      format: compact.format,
      caption: 'Every event Copperline Bank sent in the last 30 days',
      description: '730M events over the allowance, billed at the end of the month',
    },
  },
  { title: 'tone="success"', props: { value: 840, max: 50_000, tone: 'success', caption: 'Pebble & Pine' } },
];

export default function SegmentedGaugePreview() {
  return (
    <PreviewStack>
      <PreviewSection title="In a chart card, with a project switch">
        <SegmentedGaugeDemo />
      </PreviewSection>

      <PreviewSection title="Data">
        <div className="grid w-full gap-8 sm:grid-cols-2">
          {cases.map(({ title, props }) => (
            <div key={title} className="flex min-w-0 flex-col gap-2">
              <p className="font-mono text-caption text-muted-foreground">{title}</p>
              <SegmentedGauge {...props} label={title} entrance="none" />
            </div>
          ))}
          <div className="flex min-w-0 flex-col gap-2">
            <p className="font-mono text-caption text-muted-foreground">In a 160px slot</p>
            <SegmentedGauge value={2_391_700} max={3_000_000} label="Narrow" caption="Last 30 days" className="w-40" entrance="none" />
          </div>
        </div>
      </PreviewSection>

      <PreviewSection title="Entrance: always, session (default), none">
        <div className="grid w-full gap-8 sm:grid-cols-3">
          {(['always', 'session', 'none'] as const).map((entrance) => (
            <div key={entrance} className="flex min-w-0 flex-col gap-2">
              <p className="font-mono text-caption text-muted-foreground">{entrance}</p>
              <SegmentedGauge value={3_912_400} max={8_000_000} label={`Event quota, ${entrance}`} caption="Last 30 days" entrance={entrance} />
            </div>
          ))}
        </div>
      </PreviewSection>
    </PreviewStack>
  );
}
