'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { PreviewSection, PreviewStack } from '@/components/preview/preview-section';
import { ChartContainer, GrowthChart, type ChartConfig } from '@/registry/kosmos/ui/chart';
import {
  ChartCard,
  ChartCardAction,
  ChartCardContent,
  ChartCardDescription,
  ChartCardHeader,
  ChartCardLegend,
  ChartCardTitle,
  type ChartCardState,
} from '@/registry/kosmos/ui/chart-card';
import { SegmentedControl, SegmentedControlItem } from '@/registry/kosmos/ui/segmented-control';

const days = [73100, 73400, 65400, 65700, 66100, 66400, 66700, 75300, 75700, 67700, 68000, 68300, 68600, 69000];
const events = days.map((count, i) => ({ day: `Sep ${12 + i}`, current: count, previous: Math.round(count * 0.88) }));
const twoSeries = {
  current: { label: 'Last 14 days', color: 'var(--chart-1)' },
  previous: { label: 'Previous 14 days', color: 'var(--chart-2)' },
} satisfies ChartConfig;
const oneSeries = { current: { label: 'Events', color: 'var(--chart-1)' } } satisfies ChartConfig;

const platforms = [
  { week: 'Sep 14', web: 2.1, ios: 1.6, android: 0.4, server: 2.3, other: 0.2 },
  { week: 'Sep 21', web: 2.2, ios: 1.7, android: 0.4, server: 2.4, other: 0.2 },
  { week: 'Sep 28', web: 2.2, ios: 2.4, android: 0.5, server: 2.4, other: 0.3 },
  { week: 'Oct 5', web: 2.3, ios: 1.8, android: 0.5, server: 2.5, other: 0.3 },
];
const platformConfig = {
  web: { label: 'Web', color: 'var(--chart-1)' },
  ios: { label: 'iOS', color: 'var(--chart-2)' },
  android: { label: 'Android', color: 'var(--chart-3)' },
  server: { label: 'Server', color: 'var(--chart-4)' },
  other: { label: 'Other', color: 'var(--chart-5)' },
} satisfies ChartConfig;

function RangeSwitch() {
  return (
    <SegmentedControl size="sm" aria-label="Range" defaultValue="30d">
      <SegmentedControlItem value="7d">7 days</SegmentedControlItem>
      <SegmentedControlItem value="30d">30 days</SegmentedControlItem>
      <SegmentedControlItem value="90d">90 days</SegmentedControlItem>
    </SegmentedControl>
  );
}

function StateCard({ state, retry = true }: { state: ChartCardState; retry?: boolean }) {
  return (
    <ChartCard state={state}>
      <ChartCardHeader>
        <ChartCardTitle>Events</ChartCardTitle>
        <ChartCardDescription>
          {state}
          {retry ? '' : ', no retry'}
        </ChartCardDescription>
        <ChartCardAction>
          <RangeSwitch />
        </ChartCardAction>
      </ChartCardHeader>
      <ChartCardContent onRetry={retry ? () => {} : undefined}>
        <GrowthChart title="Events a day" data={events} config={oneSeries} xKey="day" />
      </ChartCardContent>
    </ChartCard>
  );
}

export default function ChartCardPreview() {
  return (
    <PreviewStack>
      <PreviewSection title="Growth chart with a range switch">
        <ChartCard>
          <ChartCardHeader>
            <ChartCardTitle>Events</ChartCardTitle>
            <ChartCardDescription>Against the 14 days before</ChartCardDescription>
            <ChartCardAction>
              <RangeSwitch />
            </ChartCardAction>
          </ChartCardHeader>
          <ChartCardContent>
            <GrowthChart title="Events a day, against the 14 days before" data={events} config={twoSeries} xKey="day" />
          </ChartCardContent>
        </ChartCard>
      </PreviewSection>

      <PreviewSection title="Stacked bars, five series, legend in the header">
        <ChartCard>
          <ChartCardHeader>
            <ChartCardTitle>Events by platform</ChartCardTitle>
            <ChartCardDescription>Each week, in millions</ChartCardDescription>
            <ChartCardLegend config={platformConfig} />
          </ChartCardHeader>
          <ChartCardContent>
            <ChartContainer config={platformConfig} className="aspect-auto h-60">
              <BarChart data={platforms} title="Events by platform, each week">
                <CartesianGrid vertical={false} />
                <XAxis dataKey="week" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} width="auto" />
                {Object.keys(platformConfig).map((key) => (
                  <Bar key={key} dataKey={key} stackId="events" fill={`var(--color-${key})`} stroke="var(--card)" maxBarSize={40} />
                ))}
              </BarChart>
            </ChartContainer>
          </ChartCardContent>
        </ChartCard>
      </PreviewSection>

      <PreviewSection title="States">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <StateCard state="loading" />
          <StateCard state="empty" />
          <StateCard state="error" />
          <StateCard state="error" retry={false} />
        </div>
      </PreviewSection>

      <PreviewSection title="Long text, title only, no header">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <ChartCard>
            <ChartCardHeader>
              <ChartCardTitle>Events received across every project and region, by day</ChartCardTitle>
              <ChartCardDescription>Against the same 14 days of the previous year, before the EU data region went live</ChartCardDescription>
              <ChartCardAction>
                <RangeSwitch />
              </ChartCardAction>
              <ChartCardLegend
                config={{
                  current: { label: 'Last 14 days, every project in every region', color: 'var(--chart-1)' },
                  previous: { label: 'Same 14 days a year ago', color: 'var(--chart-2)' },
                }}
              />
            </ChartCardHeader>
            <ChartCardContent>
              <GrowthChart title="Events a day" data={events} config={oneSeries} xKey="day" />
            </ChartCardContent>
          </ChartCard>
          <ChartCard state="empty">
            <ChartCardHeader>
              <ChartCardTitle>Events</ChartCardTitle>
            </ChartCardHeader>
            <ChartCardContent
              emptyTitle="Tidepool Notes has sent no events in the last 14 days, on any of its platforms"
              emptyDescription="Events show up here as soon as the app sends one. Check that the SDK key matches the project, then open the app once."
            />
          </ChartCard>
          <ChartCard>
            <ChartCardContent>
              <GrowthChart title="Events a day" data={events} config={oneSeries} xKey="day" />
            </ChartCardContent>
          </ChartCard>
          <div className="w-80 max-w-full">
            <ChartCard state="error">
              <ChartCardHeader>
                <ChartCardTitle>Events</ChartCardTitle>
                <ChartCardAction>
                  <RangeSwitch />
                </ChartCardAction>
              </ChartCardHeader>
              <ChartCardContent onRetry={() => {}} />
            </ChartCard>
          </div>
        </div>
      </PreviewSection>
    </PreviewStack>
  );
}
