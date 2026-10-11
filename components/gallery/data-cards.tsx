'use client';

import { Ellipsis, Mail, ShieldCheck, Trash2, UserPlus } from 'lucide-react';
import { useState } from 'react';
import { GalleryCard } from '@/components/gallery/gallery-card';
import { members, memberStatus, revenue, revenueSummary, type RevenueRange } from '@/components/gallery/data';
import { Avatar, AvatarFallback, AvatarGroup, AvatarGroupCount, AvatarImage } from '@/registry/kosmos/ui/avatar';
import { Badge } from '@/registry/kosmos/ui/badge';
import { Button } from '@/registry/kosmos/ui/button';
import { GrowthChart, Sparkline, type ChartConfig } from '@/registry/kosmos/ui/chart';
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/registry/kosmos/ui/table';

const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const rangeLabel: Record<RevenueRange, string> = { '7d': 'last 7 days', '30d': 'last 30 days', '90d': 'last 90 days' };

const revenueConfig = {
  newBusiness: { label: 'New business', color: 'var(--chart-1)' },
  expansion: { label: 'Expansion', color: 'var(--chart-2)' },
} satisfies ChartConfig;

/** Chart, SegmentedControl, Badge. */
export function RevenueCard() {
  const [range, setRange] = useState<RevenueRange>('30d');
  const summary = revenueSummary[range];
  const up = summary.change >= 0;
  return (
    <GalleryCard
      title="Revenue"
      description="New business and expansion"
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
        <Badge variant={up ? 'success' : 'destructive'}>
          {up ? '+' : '−'}
          {Math.abs(summary.change)}%<span className="sr-only"> compared with the period before</span>
        </Badge>
      </div>
      <GrowthChart
        title={`Revenue, ${rangeLabel[range]}`}
        data={revenue[range]}
        config={revenueConfig}
        xKey="label"
        xLabel="Date"
        valueFormatter={(value) => usd.format(value)}
      />
    </GalleryCard>
  );
}

const signups = [30, 42, 38, 51, 47, 60, 58, 64, 70, 66, 74, 81].map((value) => ({ value }));
const churn = [9, 8, 9, 7, 8, 6, 7, 6, 5, 6, 5, 4].map((value) => ({ value }));

/** Sparkline stat tiles, split by a 1px grid. */
export function KpiCard() {
  const tiles = [
    { label: 'Signups', value: '1,284', change: '+4.2% vs September', data: signups, color: 'var(--chart-1)' },
    { label: 'Churn', value: '1.8%', change: '−0.6 pts vs September', data: churn, color: 'var(--chart-3)' },
  ];
  return (
    <section aria-label="This month" className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-transparent bg-border shadow-card">
      {tiles.map((tile) => (
        <div key={tile.label} className="flex min-w-0 flex-col gap-1 bg-card p-4">
          <span className="text-body font-medium text-muted-foreground">{tile.label}</span>
          <span className="text-display tabular-nums">{tile.value}</span>
          <span className="truncate text-small text-muted-foreground tabular-nums">{tile.change}</span>
          <Sparkline
            data={tile.data}
            color={tile.color}
            aria-label={`${tile.label}, last 12 months, ${tile.change}`}
            className="mt-2 h-10 w-full"
          />
        </div>
      ))}
    </section>
  );
}

/** Table, Avatar, AvatarGroup, Badge, DropdownMenu (closed). */
export function MembersCard() {
  return (
    <GalleryCard
      title="Members"
      description="5 people in Halden Labs"
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
              +2<span className="sr-only"> more</span>
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
            {/* An `sr-only` span here would escape the table's scroll area and widen the page at 375px. */}
            <TableHead className="w-10" aria-label="Actions" />
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
      description="Team plan · renews on November 1"
      action={<Badge variant="secondary">Team</Badge>}
    >
      <Meter value={18} max={25}>
        <MeterLabel>Seats</MeterLabel>
        <MeterValue>{(_, value) => `${value} of 25`}</MeterValue>
        <MeterBar />
      </Meter>
      <Meter
        value={44}
        max={50}
        optimum={0}
        tone="auto"
        format={{ style: 'unit', unit: 'gigabyte', maximumFractionDigits: 1 }}
      >
        <MeterLabel>Storage</MeterLabel>
        <MeterValue>{(formatted) => `${formatted} of 50 GB`}</MeterValue>
        <MeterBar />
      </Meter>
      <Meter value={62} tone="success">
        <MeterLabel>API requests this month</MeterLabel>
        <MeterValue />
        <MeterSegments />
      </Meter>
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <p className="text-small text-muted-foreground">Storage is almost full.</p>
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
