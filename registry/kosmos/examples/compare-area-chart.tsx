'use client';

import { PreviewSection, PreviewStack } from '@/components/preview/preview-section';
import CompareAreaChartDemo from '@/registry/kosmos/examples/compare-area-chart-demo';
import { CompareAreaChart, type CompareAreaChartItem } from '@/registry/kosmos/ui/compare-area-chart';

const week: CompareAreaChartItem[] = [
  { label: 'Oct 5', name: 'Mon, Oct 5', current: 962400, previous: 941200 },
  { label: 'Oct 6', name: 'Tue, Oct 6', current: 978100, previous: 950300 },
  { label: 'Oct 7', name: 'Wed, Oct 7', current: 991500, previous: 968900 },
  { label: 'Oct 8', name: 'Thu, Oct 8', current: 953800, previous: 944700 },
  { label: 'Oct 9', name: 'Fri, Oct 9', current: 969700, previous: 952100 },
  { label: 'Oct 10', name: 'Sat, Oct 10', current: 971300, previous: 948600 },
  { label: 'Oct 11', name: 'Sun, Oct 11', current: 1012000, previous: 972600 },
];

const cases: { title: string; data: CompareAreaChartItem[] }[] = [
  { title: '7 days', data: week },
  { title: 'Below the period before', data: week.map((day) => ({ ...day, current: day.previous, previous: day.current })) },
  { title: 'One day', data: [{ label: 'Oct 11', name: 'Sun, Oct 11', current: 1012000, previous: 972600 }] },
  { title: 'Every value zero', data: week.map((day) => ({ ...day, current: 0, previous: 0 })) },
  { title: 'No data', data: [] },
  {
    title: 'Long labels and huge values',
    data: [
      { label: 'Week of September 14', name: 'Week of Monday, September 14, 2026', current: 1_234_567_890, previous: 987_654_321 },
      { label: 'Week of September 21', name: 'Week of Monday, September 21, 2026', current: 1_456_789_012, previous: 1_102_345_678 },
      { label: 'Week of September 28', name: 'Week of Monday, September 28, 2026', current: 2_468_013_579, previous: 1_234_567_890 },
    ],
  },
];

export default function CompareAreaChartPreview() {
  return (
    <PreviewStack>
      <PreviewSection title="In a chart card, with a project switch">
        <CompareAreaChartDemo />
      </PreviewSection>

      <PreviewSection title="Data">
        <div className="grid w-full gap-8 sm:grid-cols-2">
          {cases.map(({ title, data }) => (
            <div key={title} className="flex min-w-0 flex-col gap-2">
              <p className="font-mono text-caption text-muted-foreground">{title}</p>
              <CompareAreaChart data={data} label={title} currentLabel="Last 7 days" previousLabel="7 days before" entrance="none" />
            </div>
          ))}
        </div>
      </PreviewSection>

      <PreviewSection title="Entrance: always, session (default), none">
        <div className="grid w-full gap-8 sm:grid-cols-3">
          {(['always', 'session', 'none'] as const).map((entrance) => (
            <div key={entrance} className="flex min-w-0 flex-col gap-2">
              <p className="font-mono text-caption text-muted-foreground">{entrance}</p>
              <CompareAreaChart data={week} label={`Events, ${entrance}`} entrance={entrance} />
            </div>
          ))}
        </div>
      </PreviewSection>
    </PreviewStack>
  );
}
