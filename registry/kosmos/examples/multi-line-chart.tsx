'use client';

import { PreviewSection, PreviewStack } from '@/components/preview/preview-section';
import MultiLineChartDemo from '@/registry/kosmos/examples/multi-line-chart-demo';
import { MultiLineChart, type MultiLineChartPoint, type MultiLineChartSeries } from '@/registry/kosmos/ui/multi-line-chart';

const day = new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC' });

const week: MultiLineChartPoint[] = Array.from({ length: 7 }, (_, i) => ({ label: day.format(Date.UTC(2026, 9, 5 + i)) }));

const projects: MultiLineChartSeries[] = [
  { id: 'copperline', name: 'Copperline Bank', short: 'Copperline', values: [291800, 290400, 293100, 288700, 292500, 289900, 294200] },
  { id: 'fernhill', name: 'Fernhill Books', short: 'Fernhill', values: [125400, 129700, 125400, 130800, 133800, 143800, 149400] },
  { id: 'cirrus', name: 'Cirrus Weather', short: 'Cirrus', values: [72500, 72900, 73200, 73500, 82100, 82400, 72200] },
  { id: 'brightloop', name: 'Brightloop Fitness', short: 'Brightloop', values: [171300, 168900, 174200, 176500, 172800, 181600, 184300] },
  { id: 'ironbark', name: 'Ironbark Logistics', short: 'Ironbark', values: [212400, 209800, 214100, 211600, 208300, 186200, 179500] },
];

const cases: { title: string; series: MultiLineChartSeries[]; points: MultiLineChartPoint[]; hidden?: string[] }[] = [
  { title: 'Five series, one per chart color', series: projects, points: week },
  { title: 'Two of three hidden: the scale fits the one left', series: projects.slice(0, 3), points: week, hidden: ['copperline', 'fernhill'] },
  { title: 'One point', series: projects.slice(0, 3), points: week.slice(-1) },
  { title: 'Every value zero', series: projects.slice(0, 3).map((each) => ({ ...each, values: each.values.map(() => 0) })), points: week },
  { title: 'No data', series: [], points: [] },
  {
    title: 'Long labels and huge values',
    series: [
      { id: 'copperline', name: 'Copperline Bank, every server event since launch', values: [1_234_567_890, 1_456_789_012, 2_468_013_579] },
      { id: 'brightloop', name: 'Brightloop Fitness and Wellness Studios', values: [987_654_321, 1_102_345_678, 1_234_567_890] },
    ],
    points: [
      { label: 'Week of Monday, September 14, 2026', tick: 'Week of September 14' },
      { label: 'Week of Monday, September 21, 2026', tick: 'Week of September 21' },
      { label: 'Week of Monday, September 28, 2026', tick: 'Week of September 28' },
    ],
  },
];

export default function MultiLineChartPreview() {
  return (
    <PreviewStack>
      <PreviewSection title="In a chart card, with a legend that hides a project">
        <MultiLineChartDemo />
      </PreviewSection>

      <PreviewSection title="Data">
        <div className="grid w-full gap-8 sm:grid-cols-2">
          {cases.map(({ title, series, points, hidden }) => (
            <div key={title} className="flex min-w-0 flex-col gap-2">
              <p className="font-mono text-caption text-muted-foreground">{title}</p>
              <MultiLineChart series={series} points={points} hiddenSeries={hidden} label={title} entrance="none" />
            </div>
          ))}
        </div>
      </PreviewSection>

      <PreviewSection title="Entrance: always, session (default), none">
        <div className="grid w-full gap-8 sm:grid-cols-3">
          {(['always', 'session', 'none'] as const).map((entrance) => (
            <div key={entrance} className="flex min-w-0 flex-col gap-2">
              <p className="font-mono text-caption text-muted-foreground">{entrance}</p>
              <MultiLineChart series={projects.slice(0, 3)} points={week} label={`Events, ${entrance}`} entrance={entrance} />
            </div>
          ))}
        </div>
      </PreviewSection>
    </PreviewStack>
  );
}
