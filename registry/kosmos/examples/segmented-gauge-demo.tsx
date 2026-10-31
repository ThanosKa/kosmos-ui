'use client';

import * as React from 'react';
import { useChartEntrance, useCountUp } from '@/registry/kosmos/hooks/use-chart-motion';
import { cn } from '@/registry/kosmos/lib/cn';
import { ChartCard, ChartCardAction, ChartCardContent, ChartCardHeader, ChartCardTitle } from '@/registry/kosmos/ui/chart-card';
import { SegmentedControl, SegmentedControlItem } from '@/registry/kosmos/ui/segmented-control';
import { SegmentedGauge } from '@/registry/kosmos/ui/segmented-gauge';

/** Events in the last 30 days against the plan's monthly allowance. */
const projects = {
  fernhill: { name: 'Fernhill Books', short: 'Fernhill', events: 3_912_400, allowance: 8_000_000 },
  cirrus: { name: 'Cirrus Weather', short: 'Cirrus', events: 2_391_700, allowance: 3_000_000 },
  copperline: { name: 'Copperline Bank', short: 'Copperline', events: 8_730_100, allowance: 8_000_000 },
};

type ProjectId = keyof typeof projects;

const compact = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 2 });

function Count({ value, ready, instant }: { value: number; ready: boolean; instant: boolean }) {
  const shown = useCountUp(value, { ready, instant });
  return (
    <>
      <span aria-hidden>{compact.format(shown)}</span>
      <span className="sr-only">{compact.format(value)}</span>
    </>
  );
}

export default function SegmentedGaugeDemo() {
  const card = React.useRef<HTMLDivElement>(null);
  const { revealed, instant } = useChartEntrance(card);
  const [id, setId] = React.useState<ProjectId>('fernhill');
  const { name, events, allowance } = projects[id];
  const percent = Math.round((events / allowance) * 100);
  const rise = cn(
    'transition-[opacity] duration-reveal ease-power3-out motion-safe:transition-[opacity,translate]',
    !revealed && 'opacity-0 motion-safe:translate-y-1.5',
  );

  return (
    <ChartCard ref={card} data-instant={instant || undefined} className="w-full max-w-sm data-instant:**:transition-none">
      <ChartCardHeader>
        <ChartCardTitle render={<h3 />}>Event quota</ChartCardTitle>
        <ChartCardAction>
          <SegmentedControl size="sm" value={id} onValueChange={(value) => setId(value as ProjectId)} aria-label="Project">
            {(Object.keys(projects) as ProjectId[]).map((key) => (
              <SegmentedControlItem key={key} value={key}>
                {projects[key].short}
              </SegmentedControlItem>
            ))}
          </SegmentedControl>
        </ChartCardAction>
        <dl className="col-span-full mt-3 grid grid-cols-2 gap-4">
          <div className={cn('flex min-w-0 flex-col gap-1', rise)}>
            <dt className="text-small text-muted-foreground">Used</dt>
            <dd className="text-title tabular-nums">
              <Count value={events} ready={revealed} instant={instant} />
            </dd>
          </div>
          <div className={cn('flex min-w-0 flex-col items-end gap-1 text-end motion-safe:delay-80', rise)}>
            <dt className="text-small text-muted-foreground">Allowance</dt>
            <dd className="text-title tabular-nums">
              <Count value={allowance} ready={revealed} instant={instant} />
            </dd>
          </div>
        </dl>
      </ChartCardHeader>
      <ChartCardContent className="min-h-0 justify-end">
        <SegmentedGauge
          value={events}
          max={allowance}
          high={allowance * 0.75}
          label={`Event quota, ${name}`}
          caption="Last 30 days"
          description={percent > 100 ? `${percent - 100}% over the allowance` : `${100 - percent}% left`}
        />
      </ChartCardContent>
    </ChartCard>
  );
}
