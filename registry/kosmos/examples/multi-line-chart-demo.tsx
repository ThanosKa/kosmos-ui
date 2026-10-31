'use client';

import * as React from 'react';
import { useChartEntrance, useCountUp } from '@/registry/kosmos/hooks/use-chart-motion';
import { ChartCard, ChartCardContent, ChartCardDescription, ChartCardHeader, ChartCardTitle } from '@/registry/kosmos/ui/chart-card';
import {
  MultiLineChart,
  MultiLineChartLegend,
  type MultiLineChartPoint,
  type MultiLineChartSeries,
} from '@/registry/kosmos/ui/multi-line-chart';
import { StatCardDelta } from '@/registry/kosmos/ui/stat-card';

const DAY = 86_400_000;
const DAYS = 365;
const MONTH = 30;
const START = Date.UTC(2026, 9, 11) - (DAYS - 1) * DAY;

const fullDay = new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
const shortDay = new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC' });
const month = new Intl.DateTimeFormat('en-US', { month: 'short', timeZone: 'UTC' });
const whole = new Intl.NumberFormat('en-US');

/** Every day from October 12, 2025 to October 11, 2026, with the month's name under its first day. */
const points: MultiLineChartPoint[] = Array.from({ length: DAYS }, (_, i) => {
  const date = START + i * DAY;
  return { label: fullDay.format(date), tick: new Date(date).getUTCDate() === 1 ? month.format(date) : undefined };
});

const dayOf = (monthIndex: number, day: number, year = 2026) => Math.round((Date.UTC(year, monthIndex, day) - START) / DAY);
const bump = (i: number, center: number, width: number) => Math.exp(-(((i - center) / width) ** 2));

/** A seeded generator, so the server and the browser draw the same days. */
function random(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4_294_967_296 - 0.5;
  };
}

/** Slow wobble around 0, a nine-day average of noise, so the lines stay calm. */
function wobble(seed: number) {
  const next = random(seed);
  const raw = Array.from({ length: DAYS + 8 }, next);
  return Array.from({ length: DAYS }, (_, i) => raw.slice(i, i + 9).reduce((sum, value) => sum + value, 0) / 9);
}

/**
 * A year of one project's days with its own seasons, scaled so its last 30 days add up to its events. `last30`, when
 * given, replaces the last 30 days with the project's real days.
 */
function year(seed: number, from: number, to: number, season: (i: number) => number, events: number, last30?: number[]) {
  const noise = wobble(seed);
  const raw = Array.from({ length: DAYS }, (_, i) => (from + ((to - from) * i) / (DAYS - 1)) * season(i) * (1 + noise[i] * 0.3));
  const scale = events / raw.slice(-MONTH).reduce((sum, value) => sum + value, 0);
  const days = raw.map((value) => Math.round((value * scale) / 100) * 100);
  if (last30) return [...days.slice(0, -MONTH), ...last30];
  days[DAYS - 15] += events - days.slice(-MONTH).reduce((sum, value) => sum + value, 0);
  return days;
}

const series: MultiLineChartSeries[] = [
  {
    id: 'copperline',
    name: 'Copperline Bank',
    short: 'Copperline',
    values: year(8, 222_000, 296_000, (i) => 1 - 0.14 * bump(i, dayOf(11, 25, 2025), 6) + 0.06 * bump(i, dayOf(3, 15), 18), 8_730_100),
  },
  {
    id: 'fernhill',
    name: 'Fernhill Books',
    short: 'Fernhill',
    values: year(
      29,
      94_000,
      126_000,
      (i) => 1 + 0.4 * bump(i, dayOf(11, 8, 2025), 26) - 0.08 * bump(i, dayOf(0, 20), 14) + 0.12 * bump(i, dayOf(6, 10), 24),
      3_912_400,
      [
        132400, 137900, 117800, 122000, 117700, 123100, 126100, 135200, 140800, 120300, 124500, 120300, 125600, 128700, 138100, 143800,
        122900, 127100, 122800, 128200, 131300, 141000, 146500, 125400, 129700, 125400, 130800, 133800, 143800, 149400,
      ],
    ),
  },
  {
    id: 'cirrus',
    name: 'Cirrus Weather',
    short: 'Cirrus',
    values: year(
      37,
      50_000,
      74_000,
      (i) => 1 + 0.45 * bump(i, dayOf(6, 10), 36) + 0.14 * bump(i, dayOf(0, 26), 5),
      2_391_700,
      [
        73100, 73400, 65400, 65700, 66100, 66400, 66700, 75300, 75700, 67700, 68000, 68300, 68600, 69000, 77600, 77900, 69900, 70300, 70600,
        113500, 149600, 151800, 112300, 72200, 72500, 72900, 73200, 73500, 82100, 82400,
      ],
    ),
  },
];

const LAST = DAYS - 1;

export default function MultiLineChartDemo() {
  const card = React.useRef<HTMLDivElement>(null);
  const [hidden, setHidden] = React.useState<string[]>([]);
  const [emphasized, setEmphasized] = React.useState<string | null>(null);
  const shown = series.filter((each) => !hidden.includes(each.id));
  const totalOn = (day: number) => shown.reduce((sum, each) => sum + each.values[day], 0);
  const total = totalOn(LAST);
  const before = totalOn(LAST - MONTH);
  const change = Math.round(((total - before) / before) * 1000) / 10;
  const { revealed, instant } = useChartEntrance(card);
  const shownTotal = useCountUp(total, { ready: revealed, instant });
  const shownChange = useCountUp(change, { ready: revealed, instant });

  return (
    <ChartCard ref={card} className="w-full max-w-4xl">
      <ChartCardHeader>
        <ChartCardTitle render={<h3 />}>Events by project</ChartCardTitle>
        <ChartCardDescription>Per day, last 12 months</ChartCardDescription>
        <div className="col-span-full mt-3 flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
          <div className="flex min-w-0 flex-col gap-1">
            <p className="text-small text-muted-foreground">Events on {shortDay.format(START + LAST * DAY)}</p>
            <p className="text-display tabular-nums">
              <span aria-hidden>{whole.format(Math.round(shownTotal))}</span>
              <span className="sr-only">{whole.format(total)}</span>
            </p>
            <StatCardDelta value={Math.round(shownChange * 10) / 10}>vs {shortDay.format(START + (LAST - MONTH) * DAY)}</StatCardDelta>
          </div>
          <MultiLineChartLegend
            aria-label="Projects"
            series={series}
            hiddenSeries={hidden}
            onHiddenSeriesChange={setHidden}
            onEmphasizedChange={setEmphasized}
            className="-mx-2"
          />
        </div>
      </ChartCardHeader>
      <ChartCardContent className="min-h-0">
        <MultiLineChart
          series={series}
          points={points}
          hiddenSeries={hidden}
          emphasized={emphasized}
          label="Events per day by project, last 12 months"
        />
      </ChartCardContent>
    </ChartCard>
  );
}
