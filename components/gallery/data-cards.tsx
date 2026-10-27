'use client';

import { Ellipsis, Mail, ShieldCheck, Trash2, UserPlus } from 'lucide-react';
import { useState } from 'react';
import { GalleryCard } from '@/components/gallery/gallery-card';
import { members, memberStatus, revenue, revenueSummary, type RevenueRange } from '@/components/gallery/data';
import { Avatar, AvatarFallback, AvatarGroup, AvatarGroupCount, AvatarImage } from '@/registry/kosmos/ui/avatar';
import { Badge } from '@/registry/kosmos/ui/badge';
import { Button } from '@/registry/kosmos/ui/button';
import { GrowthChart, type ChartConfig } from '@/registry/kosmos/ui/chart';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/registry/kosmos/ui/dropdown-menu';
import { Meter, MeterBar, MeterLabel, MeterSegments, MeterValue } from '@/registry/kosmos/ui/meter';
import { SegmentedControl, SegmentedControlItem } from '@/registry/kosmos/ui/segmented-control';
import { Skeleton } from '@/registry/kosmos/ui/skeleton';
import { StatCard, StatCardDelta, StatCardLabel, StatCardSparkline, StatCardValue } from '@/registry/kosmos/ui/stat-card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/registry/kosmos/ui/table';

const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const rangeLabel: Record<RevenueRange, string> = { '7d': 'last 7 days', '30d': 'last 30 days', '90d': 'last 90 days' };

const revenueConfig = {
  revenue: { label: 'This period', color: 'var(--chart-1)' },
  previous: { label: 'Period before', color: 'var(--chart-1)' },
} satisfies ChartConfig;

/** Chart, SegmentedControl, Badge. */
export function RevenueCard() {
  const [range, setRange] = useState<RevenueRange>('30d');
  const summary = revenueSummary[range];
  return (
    <GalleryCard
      title="Monthly revenue"
      description="All plans, against the period before"
      action={
        <SegmentedControl
          size="sm"
          aria-label="Time range"
          value={range}
          onValueChange={(value) => setRange(value as RevenueRange)}
        >
          <SegmentedControlItem value="7d">7d</SegmentedControlItem>
          <SegmentedControlItem value="30d">30d</SegmentedControlItem>
          <SegmentedControlItem value="90d">90d</SegmentedControlItem>
        </SegmentedControl>
      }
    >
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="text-display tabular-nums">{usd.format(summary.total)}</span>
        <StatCardDelta value={summary.change}>
          <span className="sr-only">compared with the period before</span>
        </StatCardDelta>
      </div>
      <GrowthChart
        title={`Monthly revenue, ${rangeLabel[range]}`}
        data={revenue[range]}
        config={revenueConfig}
        previousKeys={['previous']}
        xKey="label"
        xLabel="Date"
        valueFormatter={(value) => usd.format(value)}
      />
    </GalleryCard>
  );
}

const signups = [30, 42, 38, 51, 47, 60, 58, 64, 70, 66, 74, 81].map((value) => ({ value }));
const droppedEvents = [9, 8, 9, 7, 8, 6, 7, 6, 5, 6, 5, 4].map((value) => ({ value }));

/** StatCard with sparklines, each its own card. */
export function KpiCard() {
  const tiles = [
    { label: 'Signups', value: '1,284', change: 4.2, goodWhen: 'up', unit: 'percent', digits: 1, data: signups, color: 'var(--chart-1)' },
    { label: 'Dropped events', value: '0.18%', change: -0.06, goodWhen: 'down', unit: 'points', digits: 2, data: droppedEvents, color: 'var(--chart-3)' },
  ] as const;
  return (
    <section aria-label="This month" className="grid grid-cols-2 gap-4">
      {tiles.map((tile) => (
        <StatCard key={tile.label}>
          <StatCardLabel>{tile.label}</StatCardLabel>
          <StatCardValue>{tile.value}</StatCardValue>
          <StatCardDelta value={tile.change} goodWhen={tile.goodWhen} fractionDigits={tile.digits} unit={tile.unit}>
            vs September
          </StatCardDelta>
          <StatCardSparkline
            data={tile.data}
            color={tile.color}
            aria-label={`${tile.label}, last 12 months, ${tile.change > 0 ? 'up' : 'down'} ${Math.abs(tile.change)}${tile.unit === 'points' ? ' points' : '%'} vs September`}
          />
        </StatCard>
      ))}
    </section>
  );
}

/** Table, Avatar, AvatarGroup, Badge, DropdownMenu (closed). */
export function MembersCard() {
  return (
    <GalleryCard
      title="Members"
      description="4 people in Acme"
      action={
        <div className="flex items-center gap-3">
          <AvatarGroup>
            {members.slice(0, 3).map(({ person }) => (
              <Avatar key={person.id} size="sm">
                {person.avatar ? <AvatarImage src={person.avatar} alt={person.name} /> : null}
                <AvatarFallback>{person.initials}</AvatarFallback>
              </Avatar>
            ))}
            <AvatarGroupCount size="sm">
              +1<span className="sr-only"> more</span>
            </AvatarGroupCount>
          </AvatarGroup>
          <Button variant="secondary" size="sm">
            <UserPlus data-icon="inline-start" />
            Invite
          </Button>
        </div>
      }
      bodyClassName="px-1 pb-1"
    >
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Member</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-10">
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map(({ person, status }) => (
            <TableRow key={person.id}>
              <TableCell className="h-13">
                <div className="flex items-center gap-2.5">
                  <Avatar>
                    {person.avatar ? <AvatarImage src={person.avatar} alt="" /> : null}
                    <AvatarFallback>{person.initials}</AvatarFallback>
                  </Avatar>
                  <div className="flex min-w-0 flex-col">
                    <span className="font-medium">{person.name}</span>
                    <span className="text-small text-muted-foreground">{person.email}</span>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={memberStatus[status].variant}>{memberStatus[status].label}</Badge>
              </TableCell>
              <TableCell className="px-2 text-end">
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={<Button variant="item" size="icon-sm" aria-label={`Actions for ${person.name}`} />}
                  >
                    <Ellipsis />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <ShieldCheck />
                      Change role
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Mail />
                      Resend invite
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem variant="destructive">
                      <Trash2 />
                      Remove from workspace
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </GalleryCard>
  );
}

/** Meter: bar, auto tone, segments. */
export function UsageCard() {
  return (
    <GalleryCard
      title="Usage"
      description="Pro plan · next invoice on November 1"
      action={<Badge variant="blue">Pro</Badge>}
    >
      <Meter value={18} max={25}>
        <MeterLabel>Seats</MeterLabel>
        <MeterValue>{(_, value) => `${value} of 25`}</MeterValue>
        <MeterBar />
      </Meter>
      <Meter value={4.4} max={5} optimum={0} tone="auto" format={{ maximumFractionDigits: 1 }}>
        <MeterLabel>Events this month</MeterLabel>
        <MeterValue>{(formatted) => `${formatted}M of 5M`}</MeterValue>
        <MeterBar />
      </Meter>
      <Meter value={62} tone="success">
        <MeterLabel>API requests this month</MeterLabel>
        <MeterValue />
        <MeterSegments />
      </Meter>
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <p className="text-small text-muted-foreground">Events are close to this month’s quota.</p>
        <Button variant="primary">Upgrade plan</Button>
      </div>
    </GalleryCard>
  );
}

/** Skeleton: a list loading. */
export function LoadingCard() {
  return (
    <GalleryCard title="Recent invoices" description="Loading the last 30 days">
      <div aria-busy="true" className="flex flex-col divide-y divide-border">
        <span className="sr-only">Loading invoices</span>
        {[0, 1, 2].map((row) => (
          <div key={row} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
            <Skeleton className="size-8 rounded-full" />
            <div className="flex flex-1 flex-col gap-2">
              <Skeleton className="h-3 w-2/5" />
              <Skeleton className="h-3 w-3/5" />
            </div>
            <Skeleton className="h-3 w-12" />
          </div>
        ))}
      </div>
    </GalleryCard>
  );
}
