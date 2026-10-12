'use client';

import { useState } from 'react';
import { PageHeader, type PageHeaderAction, type PageTab } from '@/registry/kosmos/blocks/page-header/page-header';
import { Button } from '@/registry/kosmos/ui/button';

type Status = 'live' | 'trial' | 'paused';
type Project = { id: string; name: string; domain: string; platform: string; plan: string; status: Status };

const projects: Project[] = [
  { id: 'fernhill', name: 'Fernhill Books', domain: 'fernhill.example', platform: 'web', plan: 'scale', status: 'live' },
  { id: 'brightloop', name: 'Brightloop Fitness', domain: 'brightloop.example', platform: 'ios', plan: 'scale', status: 'live' },
  { id: 'copperline', name: 'Copperline Bank', domain: 'copperline.example', platform: 'server', plan: 'scale', status: 'live' },
  { id: 'saltmarsh', name: 'Saltmarsh Coffee', domain: 'saltmarsh.example', platform: 'web', plan: 'pro', status: 'live' },
  { id: 'driftwood', name: 'Driftwood Travel', domain: 'driftwood.example', platform: 'android', plan: 'pro', status: 'live' },
  { id: 'hollowoak', name: 'Hollow Oak Games', domain: 'hollowoak.example', platform: 'android', plan: 'pro', status: 'paused' },
  { id: 'cirrus', name: 'Cirrus Weather', domain: 'cirrus.example', platform: 'ios', plan: 'pro', status: 'live' },
  { id: 'pebblepine', name: 'Pebble & Pine', domain: 'pebblepine.example', platform: 'web', plan: 'free', status: 'live' },
  { id: 'marigold', name: 'Marigold Recipes', domain: 'marigold.example', platform: 'web', plan: 'pro', status: 'trial' },
  { id: 'kiln', name: 'Kiln Studio', domain: 'kiln.example', platform: 'web', plan: 'free', status: 'paused' },
  { id: 'tidepool', name: 'Tidepool Notes', domain: 'tidepool.example', platform: 'ios', plan: 'pro', status: 'trial' },
  { id: 'ironbark', name: 'Ironbark Logistics', domain: 'ironbark.example', platform: 'server', plan: 'scale', status: 'live' },
];

const plans = ['free', 'pro', 'scale'];
const names: Record<string, string> = {
  free: 'Free',
  pro: 'Pro',
  scale: 'Scale',
  web: 'Web',
  ios: 'iOS',
  android: 'Android',
  server: 'Server',
};
const statuses: Record<Status, { label: string; dot: string }> = {
  live: { label: 'Live', dot: 'bg-success' },
  trial: { label: 'Trial', dot: 'bg-muted-foreground' },
  paused: { label: 'Paused', dot: 'bg-warning' },
};

const actionLabels: Record<PageHeaderAction, string> = {
  import: 'Import from CSV',
  export: 'Export to CSV',
  'copy-link': 'Copy link to view',
};

/** Filters in one group widen the list (Pro or Scale); filters in different groups narrow it (Pro and iOS). */
function matches(project: Project, query: string, filters: string[]) {
  const text = query.trim().toLowerCase();
  if (text && !`${project.name} ${project.domain}`.toLowerCase().includes(text)) return false;
  const planFilters = filters.filter((value) => plans.includes(value));
  const platformFilters = filters.filter((value) => !plans.includes(value));
  if (planFilters.length && !planFilters.includes(project.plan)) return false;
  if (platformFilters.length && !platformFilters.includes(project.platform)) return false;
  return true;
}

export default function PageHeaderDemo() {
  const [tab, setTab] = useState('all');
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<string[]>([]);
  const [action, setAction] = useState<PageHeaderAction | null>(null);

  const matching = projects.filter((project) => matches(project, query, filters));
  const shown = tab === 'all' ? matching : matching.filter((project) => project.status === tab);
  const tabs: PageTab[] = [
    { value: 'all', label: 'All', count: matching.length },
    ...(Object.keys(statuses) as Status[]).map((status) => ({
      value: status,
      label: statuses[status].label,
      count: matching.filter((project) => project.status === status).length,
    })),
  ];

  return (
    <div className="w-full overflow-hidden rounded-xl border border-transparent bg-background shadow-card">
      <PageHeader
        tabs={tabs}
        tab={tab}
        onTabChange={setTab}
        query={query}
        onQueryChange={setQuery}
        filters={filters}
        onFiltersChange={setFilters}
        onAction={setAction}
      >
        {shown.length ? (
          <ul aria-label="Projects" className="@container flex flex-col divide-y divide-border">
            {shown.map((project) => (
              <li key={project.id} className="flex min-h-12 items-center gap-3 px-4 py-2 text-body">
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate font-medium">{project.name}</span>
                  <span className="truncate text-small text-muted-foreground">{project.domain}</span>
                </div>
                <span className="hidden w-28 shrink-0 text-small text-muted-foreground @md:block">
                  {names[project.plan]} · {names[project.platform]}
                </span>
                <span className="flex w-16 shrink-0 items-center gap-1.5 text-small">
                  <span aria-hidden className={`size-1.5 rounded-full ${statuses[project.status].dot}`} />
                  {statuses[project.status].label}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex flex-col items-center gap-3 px-4 py-10 text-center">
            <p className="text-body text-muted-foreground">No projects match this view.</p>
            <Button
              variant="secondary"
              onClick={() => {
                setQuery('');
                setFilters([]);
                setTab('all');
              }}
            >
              Show all projects
            </Button>
          </div>
        )}
        <p aria-live="polite" className="sr-only">
          {action ? `${actionLabels[action]} picked.` : ''}
        </p>
      </PageHeader>
    </div>
  );
}
