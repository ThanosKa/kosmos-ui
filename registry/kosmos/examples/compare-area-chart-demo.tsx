'use client';

import * as React from 'react';
import { useChartEntrance, useCountUp } from '@/registry/kosmos/hooks/use-chart-motion';
import {
  ChartCard,
  ChartCardAction,
  ChartCardContent,
  ChartCardDescription,
  ChartCardHeader,
  ChartCardTitle,
} from '@/registry/kosmos/ui/chart-card';
import { CompareAreaChart, type CompareAreaChartItem } from '@/registry/kosmos/ui/compare-area-chart';
import { SegmentedControl, SegmentedControlItem } from '@/registry/kosmos/ui/segmented-control';
import { StatCardDelta } from '@/registry/kosmos/ui/stat-card';

const DAY = 86_400_000;
const monthDay = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
const fullDay = new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC' });
const compact = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 2 });
const signedCompact = (value: number) => `${value < 0 ? '−' : '+'}${compact.format(Math.abs(value))}`;

/** September 12 to October 11, 2026, each day beside the same day of the 30 before. */
function days(current: number[], previous: number[]): CompareAreaChartItem[] {
  const first = Date.UTC(2026, 8, 12);
  return current.map((value, i) => {
    const date = first + i * DAY;
    return { label: monthDay.format(date), name: fullDay.format(date), current: value, previous: previous[i] };
  });
}

const projects = {
  all: {
    name: 'All projects',
    days: days(
      [
        896600, 881200, 901500, 896700, 917100, 901300, 915500, 926100, 910100, 930900, 925800, 946700, 930300, 944800, 955600, 939000,
        960300, 954900, 976400, 959300, 974100, 985200, 967800, 989700, 984000, 1006000, 988300, 1003400, 1014600, 1012000,
      ],
      [
        794600, 768100, 778900, 789700, 795600, 796800, 799200, 820500, 793500, 804700, 815300, 821600, 822200, 824900, 846400, 818800,
        830500, 840800, 847600, 847600, 850600, 872400, 844100, 856300, 866300, 873600, 873100, 876300, 898200, 882900,
      ],
    ),
  },
  fernhill: {
    name: 'Fernhill Books',
    days: days(
      [
        132400, 137900, 117800, 122000, 117700, 123100, 126100, 135200, 140800, 120300, 124500, 120300, 125600, 128700, 138100, 143800,
        122900, 127100, 122800, 128200, 131300, 141000, 146500, 125400, 129700, 125400, 130800, 133800, 143800, 149400,
      ],
      [
        110900, 108400, 128400, 123400, 116400, 112700, 117800, 112900, 110500, 130700, 125700, 118500, 114800, 119900, 115000, 112600,
        133000, 128000, 120600, 116900, 122000, 117100, 114600, 135400, 130400, 122600, 119000, 124000, 119200, 116700,
      ],
    ),
  },
  cirrus: {
    name: 'Cirrus Weather',
    days: days(
      [
        73100, 73400, 65400, 65700, 66100, 66400, 66700, 75300, 75700, 67700, 68000, 68300, 68600, 69000, 77600, 77900, 69900, 70300, 70600,
        113500, 149600, 151800, 112300, 72200, 72500, 72900, 73200, 73500, 82100, 82400,
      ],
      [
        65600, 67700, 73200, 76300, 69700, 66800, 69300, 66400, 68600, 74200, 77300, 70500, 67600, 70200, 67300, 69300, 75200, 78200, 71400,
        68500, 71000, 68100, 70300, 76100, 79200, 72200, 69300, 71900, 69000, 71100,
      ],
    ),
  },
} satisfies Record<string, { name: string; days: CompareAreaChartItem[] }>;

type ProjectId = keyof typeof projects;

const total = (items: readonly CompareAreaChartItem[], key: 'current' | 'previous') => items.reduce((sum, item) => sum + item[key], 0);

export default function CompareAreaChartDemo() {
  const card = React.useRef<HTMLDivElement>(null);
  const [id, setId] = React.useState<ProjectId>('all');
  const { name, days } = projects[id];
  const current = total(days, 'current');
  const previous = total(days, 'previous');
  const change = Math.round(((current - previous) / previous) * 1000) / 10;
  const { revealed, instant } = useChartEntrance(card);
  const shownCurrent = useCountUp(current, { ready: revealed, instant });
  const shownGap = useCountUp(current - previous, { ready: revealed, instant });

  return (
    <ChartCard ref={card} className="w-full max-w-4xl">
      <ChartCardHeader>
        <ChartCardTitle render={<h3 />}>Events</ChartCardTitle>
        <ChartCardDescription>{name}, against the 30 days before</ChartCardDescription>
        <ChartCardAction>
          <SegmentedControl size="sm" value={id} onValueChange={(value) => setId(value as ProjectId)} aria-label="Project">
            <SegmentedControlItem value="all">All</SegmentedControlItem>
            <SegmentedControlItem value="fernhill">Fernhill</SegmentedControlItem>
            <SegmentedControlItem value="cirrus">Cirrus</SegmentedControlItem>
          </SegmentedControl>
        </ChartCardAction>
        <dl className="col-span-full mt-3 grid grid-cols-2 divide-x divide-border">
          <div className="flex min-w-0 flex-col gap-1 pe-4">
            <dt className="text-small text-muted-foreground">Last 30 days</dt>
            <dd className="text-display tabular-nums">
              <span aria-hidden>{compact.format(shownCurrent)}</span>
              <span className="sr-only">{compact.format(current)}</span>
            </dd>
          </div>
          <div className="flex min-w-0 flex-col gap-1 ps-4">
            <dt className="text-small text-muted-foreground">Change</dt>
            <dd className="flex flex-col gap-1">
              <span className="text-display tabular-nums">
                <span aria-hidden>{signedCompact(shownGap)}</span>
                <span className="sr-only">{signedCompact(current - previous)}</span>
              </span>
              <StatCardDelta value={change} />
            </dd>
          </div>
        </dl>
      </ChartCardHeader>
      <ChartCardContent className="min-h-0">
        <CompareAreaChart
          data={days}
          label={`Events per day for ${id === 'all' ? 'all projects' : name}, last 30 days against the 30 days before`}
          currentLabel="Last 30 days"
          previousLabel="30 days before"
        />
      </ChartCardContent>
    </ChartCard>
  );
}
