'use client';

import { ChartCard, ChartCardContent, ChartCardDescription, ChartCardHeader, ChartCardTitle } from '@/registry/kosmos/ui/chart-card';
import {
  DailyStackedBarChart,
  type DailyStackedBarChartItem,
  type DailyStackedBarChartSeries,
} from '@/registry/kosmos/ui/daily-stacked-bar-chart';

const DAY = 86_400_000;
const monthDay = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
const fullDay = new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC' });

const platforms: DailyStackedBarChartSeries[] = [
  { key: 'web', label: 'Web' },
  { key: 'ios', label: 'iOS' },
  { key: 'server', label: 'Server' },
  { key: 'android', label: 'Android' },
];

/** Events a day across every project, September 28 to October 11. The storm of October 2 lifts iOS for a few days. */
const events = [
  { web: 142200, ios: 247500, server: 484400, android: 38200 },
  { web: 141400, ios: 251900, server: 481300, android: 41200 },
  { web: 141100, ios: 254200, server: 480400, android: 42700 },
  { web: 143000, ios: 292700, server: 486900, android: 39400 },
  { web: 142200, ios: 332400, server: 484200, android: 42100 },
  { web: 144400, ios: 329800, server: 491800, android: 38500 },
  { web: 143100, ios: 293500, server: 487100, android: 40900 },
  { web: 153100, ios: 249800, server: 521300, android: 38200 },
  { web: 155000, ios: 254100, server: 527800, android: 41200 },
  { web: 157200, ios: 256500, server: 535100, android: 42700 },
  { web: 150300, ios: 252400, server: 511700, android: 39400 },
  { web: 152400, ios: 256300, server: 518900, android: 42100 },
  { web: 152700, ios: 260100, server: 520000, android: 38500 },
  { web: 160600, ios: 263600, server: 546900, android: 40900 },
];

const days: DailyStackedBarChartItem[] = events.map((values, i) => {
  const date = Date.UTC(2026, 9, 11) - (events.length - 1 - i) * DAY;
  return { label: monthDay.format(date), name: fullDay.format(date), values };
});

export default function DailyStackedBarChartDemo() {
  return (
    <ChartCard className="w-full max-w-4xl">
      <ChartCardHeader>
        <ChartCardTitle render={<h3 />}>Events by platform</ChartCardTitle>
        <ChartCardDescription>Last 14 days</ChartCardDescription>
      </ChartCardHeader>
      <ChartCardContent className="min-h-0">
        <DailyStackedBarChart data={days} series={platforms} label="Events by platform, last 14 days" />
      </ChartCardContent>
    </ChartCard>
  );
}
