'use client';

import { PreviewSection, PreviewStack } from '@/components/preview/preview-section';
import StackedBlockChartDemo from '@/registry/kosmos/examples/stacked-block-chart-demo';
import { StackedBlockChart, type StackedBlockChartItem, type StackedBlockChartSeries } from '@/registry/kosmos/ui/stacked-block-chart';

const platforms: StackedBlockChartSeries[] = [
  { key: 'web', label: 'Web' },
  { key: 'ios', label: 'iOS' },
  { key: 'server', label: 'Server' },
  { key: 'android', label: 'Android' },
];

const users: StackedBlockChartItem[] = [
  { label: 'Oct 2024', values: { web: 21_800, ios: 15_200, server: 5_300, android: 4_100 } },
  { label: 'Oct 2025', values: { web: 38_900, ios: 34_100, server: 11_400, android: 8_200 } },
  { label: 'Oct 2026', values: { web: 57_210, ios: 57_490, server: 17_720, android: 12_180 } },
];

const months = ['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];
const year: StackedBlockChartItem[] = months.map((month, i) => ({
  label: month,
  values: { web: 39_000 + i * 1_650, ios: 35_000 + i * 1_870, server: 11_800 + i * 540, android: 8_400 + i * 340 },
}));

const events: StackedBlockChartSeries[] = [
  { key: 'page_viewed', label: 'page_viewed' },
  { key: 'button_clicked', label: 'button_clicked' },
  { key: 'screen_viewed', label: 'screen_viewed' },
  { key: 'signed_up', label: 'signed_up' },
  { key: 'checkout_completed', label: 'checkout_completed' },
];

const cases: { title: string; data: StackedBlockChartItem[]; series?: StackedBlockChartSeries[] }[] = [
  { title: '3 periods', data: users },
  { title: '12 periods', data: year },
  { title: 'One period', data: users.slice(-1) },
  { title: 'Every value zero', data: users.map((column) => ({ ...column, values: {} })) },
  { title: 'No data', data: [] },
  {
    title: 'Five series',
    series: events,
    data: [
      { label: '7 days', values: { page_viewed: 4_178_400, button_clicked: 1_430_400, screen_viewed: 1_104_000, signed_up: 93_400, checkout_completed: 21_900 } },
      { label: '30 days', values: { page_viewed: 17_410_000, button_clicked: 5_960_000, screen_viewed: 4_600_000, signed_up: 389_000, checkout_completed: 91_200 } },
      { label: '90 days', values: { page_viewed: 53_971_000, button_clicked: 18_476_000, screen_viewed: 14_260_000, signed_up: 1_205_900, checkout_completed: 282_700 } },
    ],
  },
  {
    title: 'Long labels and huge values',
    data: [
      { label: 'October 2024, before the EU data region', values: { web: 1_234_567_890, ios: 987_654_321, server: 2_468_013_579, android: 12 } },
      { label: 'October 2026, after the EU data region', values: { web: 2_234_567_890, ios: 1_987_654_321, server: 3_468_013_579, android: 0 } },
    ],
  },
];

export default function StackedBlockChartPreview() {
  return (
    <PreviewStack>
      <PreviewSection title="In a chart card, with a metric switch">
        <StackedBlockChartDemo />
      </PreviewSection>

      <PreviewSection title="Data">
        <div className="grid w-full gap-8 sm:grid-cols-2">
          {cases.map(({ title, data, series = platforms }) => (
            <div key={title} className="flex min-w-0 flex-col gap-2">
              <p className="font-mono text-caption text-muted-foreground">{title}</p>
              <StackedBlockChart data={data} series={series} label={title} entrance="none" />
            </div>
          ))}
        </div>
      </PreviewSection>

      <PreviewSection title="Entrance: always, session (default), none">
        <div className="grid w-full gap-8 sm:grid-cols-3">
          {(['always', 'session', 'none'] as const).map((entrance) => (
            <div key={entrance} className="flex min-w-0 flex-col gap-2">
              <p className="font-mono text-caption text-muted-foreground">{entrance}</p>
              <StackedBlockChart data={users} series={platforms} label={`Users by platform, ${entrance}`} entrance={entrance} />
            </div>
          ))}
        </div>
      </PreviewSection>
    </PreviewStack>
  );
}
