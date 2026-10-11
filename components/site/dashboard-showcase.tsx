'use client';

import { Layers } from 'lucide-react';
import * as React from 'react';
import { AppSidebar, type AppSidebarNavItem } from '@/registry/kosmos/blocks/app-sidebar/app-sidebar';
import { DataTable, type Account } from '@/registry/kosmos/blocks/data-table/data-table';
import { PageHeader, type PageTab, type PageView } from '@/registry/kosmos/blocks/page-header/page-header';
import { StatsOverview } from '@/registry/kosmos/blocks/stats-overview/stats-overview';
import { Button } from '@/registry/kosmos/ui/button';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/registry/kosmos/ui/empty';
import { SidebarProvider, SidebarResizeHandle, SidebarTrigger } from '@/registry/kosmos/ui/sidebar';

/*
 * The live dashboard on the landing page, composed from the free blocks with the same "Acme Inc." sample
 * workspace the blocks ship with. Only the Accounts page and its saved views are wired up; the other
 * pages say so and link back.
 */

const maya = { name: 'Maya Chen', initials: 'MC' };
const jonas = { name: 'Jonas Weber', initials: 'JW' };
const priya = { name: 'Priya Raman', initials: 'PR' };
const owners = { maya, jonas, priya };

const accounts: Account[] = [
  { id: 'northwind', name: 'Northwind Traders', domain: 'northwind.example', status: 'active', owner: maya, arr: 184000, health: 86, lastActivity: '2026-10-10' },
  { id: 'bluebird', name: 'Bluebird Labs', domain: 'bluebird.example', status: 'at-risk', owner: jonas, arr: 96500, health: 38, lastActivity: '2026-09-21' },
  { id: 'cedar', name: 'Cedar & Pine', domain: 'cedarpine.example', status: 'active', owner: priya, arr: 42000, health: 74, lastActivity: '2026-10-08' },
  { id: 'lumen', name: 'Lumen Health', domain: 'lumenhealth.example', status: 'trial', owner: maya, arr: 0, health: 55, lastActivity: '2026-10-11' },
  { id: 'orbit', name: 'Orbit Freight', domain: 'orbitfreight.example', status: 'active', owner: jonas, arr: 238000, health: 91, lastActivity: '2026-10-09' },
  { id: 'harbor', name: 'Harbor Savings Bank', domain: 'harborbank.example', status: 'churned', owner: priya, arr: 0, health: 12, lastActivity: '2026-08-30' },
  { id: 'quill', name: 'Quill Studio', domain: 'quill.example', status: 'at-risk', owner: maya, arr: 18400, health: 41, lastActivity: '2026-09-28' },
  { id: 'vela', name: 'Vela Robotics', domain: 'vela.example', status: 'active', owner: priya, arr: 127000, health: 68, lastActivity: '2026-10-06' },
  { id: 'tidewater', name: 'Tidewater Outfitters', domain: 'tidewater.example', status: 'active', owner: jonas, arr: 64800, health: 79, lastActivity: '2026-10-07' },
  { id: 'kestrel', name: 'Kestrel Analytics', domain: 'kestrel.example', status: 'trial', owner: priya, arr: 0, health: 62, lastActivity: '2026-10-10' },
];

const tabStatus = { all: 'all', active: 'active', 'at-risk': 'at-risk', churned: 'churned' } as const;
type TabValue = keyof typeof tabStatus;

const tabs: PageTab[] = [
  { value: 'all', label: 'All accounts', count: accounts.length },
  { value: 'active', label: 'Active', count: accounts.filter((row) => row.status === 'active').length },
  { value: 'at-risk', label: 'At risk', count: accounts.filter((row) => row.status === 'at-risk').length },
  { value: 'churned', label: 'Churned', count: accounts.filter((row) => row.status === 'churned').length },
];

const filterOptions = (Object.keys(owners) as (keyof typeof owners)[]).map((key) => ({
  value: key,
  label: `Owned by ${owners[key].name}`,
}));

const views: AppSidebarNavItem[] = [
  { id: 'view-mine', label: 'Owned by me', href: '#view-mine', icon: Layers },
  {
    id: 'view-at-risk',
    label: 'At risk',
    href: '#view-at-risk',
    icon: Layers,
    badge: tabs.find((tab) => tab.value === 'at-risk')?.count,
    badgeLabel: 'accounts',
  },
];

/** What each saved view sets on the Accounts page. */
const viewState: Record<string, { title: string; tab: TabValue; filters: string[] }> = {
  accounts: { title: 'Accounts', tab: 'all', filters: [] },
  'view-mine': { title: 'Owned by me', tab: 'all', filters: ['maya'] },
  'view-at-risk': { title: 'At risk', tab: 'at-risk', filters: [] },
};

const pageTitles: Record<string, string> = {
  home: 'Home',
  inbox: 'Inbox',
  deals: 'Deals',
  reports: 'Reports',
  help: 'Help and feedback',
  settings: 'Settings',
};

export function DashboardShowcase() {
  const [page, setPage] = React.useState('accounts');
  const [tab, setTab] = React.useState<TabValue>('all');
  const [query, setQuery] = React.useState('');
  const [filters, setFilters] = React.useState<string[]>([]);
  const [view, setView] = React.useState<PageView>('table');

  const navigate = (id: string, event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault();
    setPage(id);
    const preset = viewState[id];
    if (preset) {
      setTab(preset.tab);
      setFilters(preset.filters);
      setQuery('');
    }
  };

  const rows = React.useMemo(() => {
    if (!filters.length) return accounts;
    return accounts.filter((row) =>
      filters.some((key) => owners[key as keyof typeof owners]?.name === row.owner.name),
    );
  }, [filters]);

  const accountsPage = viewState[page];

  return (
    <SidebarProvider className="min-h-0 overflow-hidden rounded-2xl border border-transparent shadow-card md:h-[50rem]">
      {/* TODO(ticket 16): pass onSearch to open the CommandMenu block. */}
      <AppSidebar activeItem={page} onNavigate={navigate} navViews={views} />
      <SidebarResizeHandle />
      <div className="relative flex min-w-0 flex-1 flex-col bg-background md:overflow-y-auto">
        {accountsPage ? (
          <PageHeader
            title={accountsPage.title}
            leading={<SidebarTrigger className="-ms-1" />}
            tabs={tabs}
            tab={tab}
            onTabChange={(value) => setTab(value as TabValue)}
            query={query}
            onQueryChange={setQuery}
            filterOptions={filterOptions}
            filters={filters}
            onFiltersChange={setFilters}
            view={view}
            onViewChange={setView}
            // TODO(ticket 16): onNew opens the NewItemDialog block.
          >
            {view === 'table' ? (
              <div className="flex flex-col gap-4 p-4">
                <StatsOverview />
                <div className="overflow-hidden rounded-2xl border border-transparent bg-card shadow-card">
                  {/* TODO(ticket 16): onOpen opens the DetailDrawer block. */}
                  <DataTable
                    rows={rows}
                    query={query}
                    status={tabStatus[tab]}
                    onClearFilters={() => {
                      setQuery('');
                      setFilters([]);
                      setTab('all');
                    }}
                  />
                </div>
              </div>
            ) : (
              // TODO(ticket 16): the KanbanBoard block, accounts grouped by status.
              <Placeholder title="Board view" onBack={() => setView('table')} backLabel="Back to the table" />
            )}
          </PageHeader>
        ) : (
          <>
            <div className="flex h-14 items-center gap-2 border-b border-border px-4">
              <SidebarTrigger className="-ms-1" />
              <h1 className="min-w-0 flex-1 truncate text-heading">{pageTitles[page]}</h1>
            </div>
            <Placeholder
              title={pageTitles[page]}
              onBack={(event) => navigate('accounts', event)}
              backLabel="Go to Accounts"
            />
          </>
        )}
      </div>
    </SidebarProvider>
  );
}

function Placeholder({
  title,
  onBack,
  backLabel,
}: {
  title: string;
  onBack: (event: React.MouseEvent<HTMLElement>) => void;
  backLabel: string;
}) {
  return (
    <Empty className="flex-1 py-16">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Layers />
        </EmptyMedia>
        <EmptyTitle render={<h2 />}>{title} isn’t part of this demo</EmptyTitle>
        <EmptyDescription>Accounts and its saved views are live. Everything there is built from Kosmos blocks.</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button variant="secondary" onClick={onBack}>
          {backLabel}
        </Button>
      </EmptyContent>
    </Empty>
  );
}
