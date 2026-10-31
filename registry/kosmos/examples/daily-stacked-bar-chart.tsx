'use client';

import { PreviewSection, PreviewStack } from '@/components/preview/preview-section';
import DailyStackedBarChartDemo from '@/registry/kosmos/examples/daily-stacked-bar-chart-demo';
import {
  DailyStackedBarChart,
  type DailyStackedBarChartItem,
  type DailyStackedBarChartSeries,
} from '@/registry/kosmos/ui/daily-stacked-bar-chart';

const platforms: DailyStackedBarChartSeries[] = [
  { key: 'web', label: 'Web' },
  { key: 'ios', label: 'iOS' },
  { key: 'server', label: 'Server' },
  { key: 'android', label: 'Android' },
];

const week: DailyStackedBarChartItem[] = [
  { label: 'Oct 5', name: 'Mon, Oct 5', values: { web: 153100, ios: 249800, server: 521300, android: 38200 } },
  { label: 'Oct 6', name: 'Tue, Oct 6', values: { web: 155000, ios: 254100, server: 527800, android: 41200 } },
  { label: 'Oct 7', name: 'Wed, Oct 7', values: { web: 157200, ios: 256500, server: 535100, android: 42700 } },
  { label: 'Oct 8', name: 'Thu, Oct 8', values: { web: 150300, ios: 252400, server: 511700, android: 39400 } },
  { label: 'Oct 9', name: 'Fri, Oct 9', values: { web: 152400, ios: 256300, server: 518900, android: 42100 } },
  { label: 'Oct 10', name: 'Sat, Oct 10', values: { web: 152700, ios: 260100, server: 520000, android: 38500 } },
  { label: 'Oct 11', name: 'Sun, Oct 11', values: { web: 160600, ios: 263600, server: 546900, android: 40900 } },
];

const month: DailyStackedBarChartItem[] = Array.from({ length: 30 }, (_, i) => ({
  label: `Day ${i + 1}`,
  values: { web: 140000 + i * 600, ios: 238000 + (i % 4) * 6000, server: 470000 + i * 2400, android: 38000 + (i % 3) * 1500 },
}));

const events: DailyStackedBarChartSeries[] = [
  { key: 'page_viewed', label: 'page_viewed' },
  { key: 'button_clicked', label: 'button_clicked' },
  { key: 'screen_viewed', label: 'screen_viewed' },
  { key: 'signed_up', label: 'signed_up' },
  { key: 'checkout_completed', label: 'checkout_completed' },
];

const longSeries: DailyStackedBarChartSeries[] = [
  { key: 'web', label: 'Web, including the marketing site and every docs page' },
  { key: 'ios', label: 'iOS and iPadOS apps' },
];

const cases: { title: string; data: DailyStackedBarChartItem[]; series?: DailyStackedBarChartSeries[] }[] = [
  { title: '7 days', data: week },
  { title: '30 days: the labels thin out', data: month },
  { title: 'One day', data: week.slice(-1) },
  { title: 'Every value zero', data: week.map((day) => ({ ...day, values: {} })) },
  { title: 'No data', data: [] },
  {
    title: 'Five series',
    series: events,
    data: week.map((day, i) => ({
      ...day,
      values: { page_viewed: 590000 + i * 2000, button_clicked: 202000, screen_viewed: 156000 + i * 900, signed_up: 13000, checkout_completed: 3000 },
    })),
  },
  {
    title: 'Long labels and huge values',
    series: longSeries,
    data: [
      { label: 'Week of Sep 14', values: { web: 1_234_567_890, ios: 987_654_321 } },
      { label: 'Week of Sep 21', values: { web: 1_334_567_890, ios: 1_087_654_321 } },
      { label: 'Week of Sep 28', values: { web: 1_468_013_579, ios: 1_187_654_321 } },
    ],
  },
];

export default function DailyStackedBarChartPreview() {
  return (
    <PreviewStack>
      <PreviewSection title="In a chart card">
        <DailyStackedBarChartDemo />
      </PreviewSection>

      <PreviewSection title="Data">
        <div className="grid w-full gap-8 sm:grid-cols-2">
          {cases.map(({ title, data, series = platforms }) => (
            <div key={title} className="flex min-w-0 flex-col gap-2">
              <p className="font-mono text-caption text-muted-foreground">{title}</p>
              <DailyStackedBarChart data={data} series={series} label={title} entrance="none" />
            </div>
          ))}
        </div>
      </PreviewSection>

      <PreviewSection title="Entrance: always, session (default), none">
        <div className="grid w-full gap-8 lg:grid-cols-3">
          {(['always', 'session', 'none'] as const).map((entrance) => (
            <div key={entrance} className="flex min-w-0 flex-col gap-2">
              <p className="font-mono text-caption text-muted-foreground">{entrance}</p>
              <DailyStackedBarChart data={week} series={platforms} label={`Events by platform, ${entrance}`} entrance={entrance} />
            </div>
          ))}
        </div>
      </PreviewSection>
    </PreviewStack>
  );
}
