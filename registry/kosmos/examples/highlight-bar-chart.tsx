'use client';

import { PreviewSection, PreviewStack } from '@/components/preview/preview-section';
import HighlightBarChartDemo from '@/registry/kosmos/examples/highlight-bar-chart-demo';
import { HighlightBarChart, type HighlightBarChartItem } from '@/registry/kosmos/ui/highlight-bar-chart';

const week: HighlightBarChartItem[] = [
  { label: 'Mon', name: 'Mon, Oct 5', value: 962400 },
  { label: 'Tue', name: 'Tue, Oct 6', value: 978100 },
  { label: 'Wed', name: 'Wed, Oct 7', value: 991500 },
  { label: 'Thu', name: 'Thu, Oct 8', value: 953800 },
  { label: 'Fri', name: 'Fri, Oct 9', value: 969700 },
  { label: 'Sat', name: 'Sat, Oct 10', value: 971300 },
  { label: 'Sun', name: 'Sun, Oct 11', value: 1012000 },
];

const month = Array.from({ length: 30 }, (_, i) => ({ label: `Day ${i + 1}`, value: 896600 + i * 4000 + (i % 3) * 9000 }));

const cases: { title: string; data: HighlightBarChartItem[] }[] = [
  { title: '7 bars', data: week },
  { title: '30 bars: only the first and last labels', data: month },
  { title: 'One bar', data: [{ label: 'Oct', value: 28495200 }] },
  { title: 'Every value zero', data: week.map((bar) => ({ ...bar, value: 0 })) },
  { title: 'No data', data: [] },
  {
    title: 'Long labels and huge values',
    data: [
      { label: 'Ironbark Logistics', value: 1_234_567_890 },
      { label: 'Cirrus Weather', value: 987_654_321 },
      { label: 'Brightloop Fitness and Wellness Studios', value: 2_468_013_579 },
    ],
  },
];

export default function HighlightBarChartPreview() {
  return (
    <PreviewStack>
      <PreviewSection title="In a chart card, with a range switch">
        <HighlightBarChartDemo />
      </PreviewSection>

      <PreviewSection title="Data">
        <div className="grid w-full gap-8 sm:grid-cols-2">
          {cases.map(({ title, data }) => (
            <div key={title} className="flex min-w-0 flex-col gap-2">
              <p className="font-mono text-caption text-muted-foreground">{title}</p>
              <HighlightBarChart data={data} label={title} entrance="none" />
            </div>
          ))}
        </div>
      </PreviewSection>

      <PreviewSection title="Entrance: always, session (default), none">
        <div className="grid w-full gap-8 sm:grid-cols-3">
          {(['always', 'session', 'none'] as const).map((entrance) => (
            <div key={entrance} className="flex min-w-0 flex-col gap-2">
              <p className="font-mono text-caption text-muted-foreground">{entrance}</p>
              <HighlightBarChart data={week} label={`Events, ${entrance}`} entrance={entrance} />
            </div>
          ))}
        </div>
      </PreviewSection>
    </PreviewStack>
  );
}
