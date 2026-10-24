'use client';

import * as React from 'react';
import { PaginationLoadMore } from '@/registry/kosmos/ui/pagination';

const projects = [
  { name: 'Fernhill Books', domain: 'fernhill.example' },
  { name: 'Brightloop Fitness', domain: 'brightloop.example' },
  { name: 'Copperline Bank', domain: 'copperline.example' },
  { name: 'Saltmarsh Coffee', domain: 'saltmarsh.example' },
  { name: 'Driftwood Travel', domain: 'driftwood.example' },
  { name: 'Hollow Oak Games', domain: 'hollowoak.example' },
  { name: 'Cirrus Weather', domain: 'cirrus.example' },
  { name: 'Pebble & Pine', domain: 'pebblepine.example' },
  { name: 'Marigold Recipes', domain: 'marigold.example' },
  { name: 'Kiln Studio', domain: 'kiln.example' },
  { name: 'Tidepool Notes', domain: 'tidepool.example' },
  { name: 'Ironbark Logistics', domain: 'ironbark.example' },
];

const step = 4;

export default function PaginationLoadMoreExample() {
  const [shown, setShown] = React.useState(step);
  const [loading, setLoading] = React.useState(false);

  const loadMore = () => {
    setLoading(true);
    // Stands in for the request that fetches the next rows.
    window.setTimeout(() => {
      setShown((current) => Math.min(projects.length, current + step));
      setLoading(false);
    }, 600);
  };

  return (
    <div className="flex w-full max-w-sm flex-col gap-4">
      <ul aria-label="Projects" className="divide-y divide-border rounded-2xl border border-transparent bg-card shadow-card">
        {projects.slice(0, shown).map((project) => (
          <li key={project.domain} className="flex flex-col px-4 py-2.5">
            <span className="truncate text-body font-medium">{project.name}</span>
            <span className="truncate text-small text-muted-foreground">{project.domain}</span>
          </li>
        ))}
      </ul>
      <PaginationLoadMore shown={shown} total={projects.length} loading={loading} onLoadMore={loadMore} />
    </div>
  );
}
