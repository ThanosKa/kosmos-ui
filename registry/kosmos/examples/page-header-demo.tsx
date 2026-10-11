'use client';

import { useState } from 'react';
import { PageHeader, type PageView } from '@/registry/kosmos/blocks/page-header/page-header';

const tabLabels: Record<string, string> = {
  all: 'all accounts',
  active: 'active accounts',
  'at-risk': 'accounts at risk',
  churned: 'churned accounts',
};

export default function PageHeaderDemo() {
  const [tab, setTab] = useState('all');
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<string[]>([]);
  const [view, setView] = useState<PageView>('table');

  return (
    <div className="w-full overflow-hidden rounded-xl border border-transparent bg-background shadow-card">
      <PageHeader
        tab={tab}
        onTabChange={setTab}
        query={query}
        onQueryChange={setQuery}
        filters={filters}
        onFiltersChange={setFilters}
        view={view}
        onViewChange={setView}
      >
        <p className="p-4 text-body text-muted-foreground">
          Showing {tabLabels[tab]} as a {view}
          {query ? ` matching “${query}”` : ''}
          {filters.length ? `, ${filters.length} ${filters.length === 1 ? 'filter' : 'filters'} on` : ''}.
        </p>
      </PageHeader>
    </div>
  );
}
