'use client';

import type * as React from 'react';
import { AppSidebar } from '@/registry/kosmos/blocks/app-sidebar/app-sidebar';
import { StatsOverview } from '@/registry/kosmos/blocks/stats-overview/stats-overview';
import { Avatar, AvatarFallback, AvatarImage } from '@/registry/kosmos/ui/avatar';
import { Badge } from '@/registry/kosmos/ui/badge';
import { DonutChart, type DonutChartItem } from '@/registry/kosmos/ui/donut-chart';
import { SidebarInset, SidebarProvider } from '@/registry/kosmos/ui/sidebar';
import { StatusDot, type Status } from '@/registry/kosmos/ui/status';

const sources: DonutChartItem[] = [
  { label: 'Direct', value: 48210 },
  { label: 'Search', value: 31480 },
  { label: 'Referral', value: 18640 },
  { label: 'Social', value: 12940 },
  { label: 'Email', value: 6120 },
];

const visitors = sources.reduce((sum, source) => sum + source.value, 0);
const number = new Intl.NumberFormat('en-US');

const activity: { id: string; name: string; event: string; time: string; status: Status; label: string }[] = [
  { id: 'lumenfield', name: 'Lumenfield Health', event: 'Lumenfield Health started a trial', time: '2m ago', status: 'running', label: 'Trial' },
  { id: 'fernhill', name: 'Fernhill Books', event: 'Fernhill Books upgraded to Pro', time: '14m ago', status: 'done', label: 'Upgraded' },
  { id: 'saltmarsh', name: 'Saltmarsh Coffee', event: 'Quota alert on Saltmarsh Coffee', time: '38m ago', status: 'waiting', label: 'Alert' },
  { id: 'copperline', name: 'Copperline Bank', event: 'Copperline Bank rotated an API key', time: '1h ago', status: 'done', label: 'Done' },
  { id: 'hollowoak', name: 'Hollow Oak Games', event: 'Hollow Oak Games paused ingestion', time: '3h ago', status: 'skipped', label: 'Paused' },
];

const cardClass = 'min-w-0 rounded-2xl border border-transparent bg-card p-4 shadow-card';

/** Visitors by source: a donut with the total in its hole, beside a legend with each count and share. */
function TrafficSources() {
  return (
    <section className={cardClass}>
      <h4 className="text-body font-medium">Traffic sources</h4>
      <div className="mt-3 flex items-center gap-5">
        <DonutChart data={sources} label="Visitors" format={number.format} aria-label={`${number.format(visitors)} visitors`} />
        <ul aria-label="Visitors by source" className="flex min-w-0 flex-1 flex-col gap-2">
          {sources.map((source, i) => (
            <li key={source.label} className="flex items-center gap-2 text-small">
              <span
                aria-hidden
                style={{ '--part': `var(--chart-${i + 1})` } as React.CSSProperties}
                className="size-2 shrink-0 rounded-full bg-(--part)"
              />
              <span className="min-w-0 flex-1 truncate">{source.label}</span>
              <span className="tabular-nums">{number.format(source.value)}</span>
              <span className="w-9 text-end text-muted-foreground tabular-nums">{Math.round((source.value / visitors) * 100)}%</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/** The latest account events, newest first, each with its age and a status badge on a wide enough card. */
function RecentActivity() {
  return (
    <section className={cardClass}>
      <h4 className="text-body font-medium">Recent activity</h4>
      <ul className="mt-2 divide-y divide-border">
        {activity.map((item) => (
          <li key={item.id} className="flex items-center gap-3 py-2 first:pt-1">
            <Avatar size="sm" aria-hidden className="rounded-md">
              <AvatarImage src={`/logos/${item.id}.svg`} alt="" />
              <AvatarFallback>{item.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <span className="min-w-0 flex-1 truncate text-small">{item.event}</span>
            <span className="shrink-0 text-caption text-muted-foreground tabular-nums">{item.time}</span>
            <Badge variant="secondary" className="hidden shrink-0 @2xl:inline-flex">
              <StatusDot status={item.status} className="text-caption">
                {item.label}
              </StatusDot>
            </Badge>
          </li>
        ))}
      </ul>
    </section>
  );
}

/**
 * The landing hero's product: the app sidebar and an analytics overview. Stats overview without its top events, then
 * traffic sources and recent activity side by side. It shows a different screen from the Projects table further down the page.
 */
function LandingHeroProduct() {
  return (
    <SidebarProvider storageKey={false} keyboardShortcut={false} className="h-full min-h-0">
      <AppSidebar activeItem="overview" onNavigate={(_id, event) => event.preventDefault()} />
      <SidebarInset render={<div />} className="overflow-hidden">
        <header className="flex h-12 shrink-0 items-center border-b border-border px-4">
          <h3 className="truncate text-body font-medium">Overview</h3>
        </header>
        <div className="@container flex flex-col gap-4 p-4 @max-md:p-2">
          <StatsOverview topEvents={false} />
          <div className="grid gap-4 @xl:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
            <TrafficSources />
            <RecentActivity />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export { LandingHeroProduct };
