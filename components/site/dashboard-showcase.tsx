'use client';

import { BarChart3, Building2, Handshake, Home, Inbox, Layers, Plus, Settings } from 'lucide-react';
import * as React from 'react';
import { AppSidebar, type AppSidebarNavItem } from '@/registry/kosmos/blocks/app-sidebar/app-sidebar';
import { CommandMenu, type CommandMenuGroup } from '@/registry/kosmos/blocks/command-menu/command-menu';
import { DataTable, sampleAccounts, type Account, type AccountStatus } from '@/registry/kosmos/blocks/data-table/data-table';
import { DetailDrawer, type DetailAccount } from '@/registry/kosmos/blocks/detail-drawer/detail-drawer';
import { KanbanBoard, type KanbanItem } from '@/registry/kosmos/blocks/kanban-board/kanban-board';
import { NewItemDialog, type NewItemStatus, type NewItemValues } from '@/registry/kosmos/blocks/new-item-dialog/new-item-dialog';
import { PageHeader, type PageTab } from '@/registry/kosmos/blocks/page-header/page-header';
import { StatsOverview } from '@/registry/kosmos/blocks/stats-overview/stats-overview';
import { Button } from '@/registry/kosmos/ui/button';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/registry/kosmos/ui/empty';
import { SidebarProvider, SidebarResizeHandle, SidebarTrigger } from '@/registry/kosmos/ui/sidebar';

/*
 * The live dashboard on the landing page, composed from the eight free blocks. The stats overview shows its
 * Parallax sample data; the other blocks still share one array of sample records, so a change in the table shows
 * on the board, in the drawer and in the command menu. Only the list page, its saved views and the board are
 * wired up; the other pages say so and link back.
 */

const maya = { name: 'Maya Chen', initials: 'MC' };
const jonas = { name: 'Jonas Weber', initials: 'JW' };
const priya = { name: 'Priya Raman', initials: 'PR' };
const owners = { maya, jonas, priya };
type OwnerKey = keyof typeof owners;

// The data table's sample accounts, plus two more so the board's columns fill up.
const initialAccounts: Account[] = [
  ...sampleAccounts,
  { id: 'tidewater', name: 'Tidewater Outfitters', domain: 'tidewater.example', status: 'active', owner: jonas, arr: 64800, health: 79, lastActivity: '2026-10-07' },
  { id: 'kestrel', name: 'Kestrel Analytics', domain: 'kestrel.example', status: 'trial', owner: priya, arr: 0, health: 62, lastActivity: '2026-10-10' },
];

/** What the drawer shows beyond the table's columns, for a few accounts. */
const details: Record<string, Pick<DetailAccount, 'meta' | 'labels' | 'notes' | 'activity'>> = {
  bluebird: {
    meta: 'Enterprise plan · customer since March 2024',
    labels: ['Enterprise', 'Renewal in Q1'],
    notes: 'Usage dropped by a third after their team moved to a new data warehouse. The renewal is due in January.',
    activity: [
      { id: 'b1', author: jonas, action: 'changed the status to At risk', time: 'Sep 21' },
      { id: 'b2', author: maya, body: 'Booked a call with their data lead for next week.', time: 'Sep 23' },
    ],
  },
  northwind: {
    meta: 'Enterprise plan · customer since June 2022',
    labels: ['Enterprise', 'Reference customer'],
    notes: 'Rolling out to their European offices this quarter.',
    activity: [{ id: 'n1', author: maya, body: 'Signed the expansion for 120 more seats.', time: 'Oct 10' }],
  },
};

const tabStatus = { all: 'all', active: 'active', 'at-risk': 'at-risk', churned: 'churned' } as const;
type TabValue = keyof typeof tabStatus;

const columns = [
  { id: 'trial', title: 'Trial', tone: 'muted' },
  { id: 'active', title: 'Active', tone: 'success' },
  { id: 'at-risk', title: 'At risk', tone: 'warning' },
  { id: 'churned', title: 'Churned', tone: 'destructive' },
] as const;

const statusDot: Record<AccountStatus, string> = {
  trial: 'bg-muted-foreground',
  active: 'bg-success',
  'at-risk': 'bg-warning',
  churned: 'bg-destructive',
};

const filterOptions = (Object.keys(owners) as OwnerKey[]).map((key) => ({
  value: key,
  label: `Owned by ${owners[key].name}`,
}));

/** What each saved view sets on the Accounts page. */
const viewState: Record<string, { title: string; tab: TabValue; filters: string[] }> = {
  accounts: { title: 'Accounts', tab: 'all', filters: [] },
  'view-mine': { title: 'Owned by me', tab: 'all', filters: ['maya'] },
  'view-at-risk': { title: 'At risk', tab: 'at-risk', filters: [] },
};

const pageTitles: Record<string, string> = {
  home: 'Home',
  inbox: 'Inbox',
  reports: 'Reports',
  help: 'Help and feedback',
  settings: 'Settings',
};

const goTo = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'inbox', label: 'Inbox', icon: Inbox },
  { id: 'accounts', label: 'Accounts', icon: Building2 },
  { id: 'deals', label: 'Deals', icon: Handshake },
  { id: 'reports', label: 'Reports', icon: BarChart3 },
  { id: 'settings', label: 'Settings', icon: Settings },
];

const slug = (name: string) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'account';

export function DashboardShowcase() {
  const [accounts, setAccounts] = React.useState(initialAccounts);
  const [page, setPage] = React.useState('accounts');
  const [tab, setTab] = React.useState<TabValue>('all');
  const [query, setQuery] = React.useState('');
  const [filters, setFilters] = React.useState<string[]>([]);
  // The drawer keeps showing the last account while it closes, so `openId` outlives `drawerOpen`.
  const [openId, setOpenId] = React.useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [newOpen, setNewOpen] = React.useState(false);
  const [newStatus, setNewStatus] = React.useState<NewItemStatus>('trial');
  const [commandOpen, setCommandOpen] = React.useState(false);

  const showPage = (id: string) => {
    setPage(id);
    const preset = viewState[id];
    if (preset) {
      setTab(preset.tab);
      setFilters(preset.filters);
      setQuery('');
    }
  };
  const navigate = (id: string, event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault();
    showPage(id);
  };

  const openAccount = (id: string) => {
    setOpenId(id);
    setDrawerOpen(true);
  };

  const openNew = (status: NewItemStatus) => {
    setNewStatus(status);
    setNewOpen(true);
  };

  const create = (values: NewItemValues) => {
    const base = slug(values.name);
    const id = accounts.some((row) => row.id === base) ? `${base}-${accounts.length}` : base;
    const owner = values.owner ? owners[values.owner as OwnerKey] : undefined;
    setAccounts([
      {
        id,
        name: values.name,
        domain: values.domain,
        status: values.status,
        // The table needs an owner: an account created without one goes to the signed-in user.
        owner: owner ?? maya,
        arr: values.arr ?? 0,
        health: 50,
        lastActivity: '2026-10-11',
      },
      ...accounts,
    ]);
  };

  const ownerFiltered = React.useMemo(
    () =>
      filters.length
        ? accounts.filter((row) => filters.some((key) => owners[key as OwnerKey]?.name === row.owner.name))
        : accounts,
    [accounts, filters],
  );

  const tabs: PageTab[] = [
    { value: 'all', label: 'All accounts', count: accounts.length },
    { value: 'active', label: 'Active', count: accounts.filter((row) => row.status === 'active').length },
    { value: 'at-risk', label: 'At risk', count: accounts.filter((row) => row.status === 'at-risk').length },
    { value: 'churned', label: 'Churned', count: accounts.filter((row) => row.status === 'churned').length },
  ];

  const views: AppSidebarNavItem[] = [
    { id: 'view-mine', label: 'Owned by me', href: '#view-mine', icon: Layers },
    { id: 'view-at-risk', label: 'At risk', href: '#view-at-risk', icon: Layers, badge: tabs[2].count, badgeLabel: 'accounts' },
  ];

  const commandGroups: CommandMenuGroup[] = [
    {
      value: 'Accounts',
      items: accounts.map((row) => ({
        value: `open:${row.id}`,
        label: `${row.name} ${row.domain}`,
        title: row.name,
        hint: row.domain,
        dot: statusDot[row.status],
      })),
    },
    { value: 'Actions', items: [{ value: 'new-account', label: 'New account', icon: Plus }] },
    { value: 'Go to', items: goTo.map((item) => ({ value: `go:${item.id}`, label: item.label, icon: item.icon })) },
  ];

  const runCommand = (value: string) => {
    if (value === 'new-account') openNew('trial');
    else if (value.startsWith('open:')) {
      showPage('accounts');
      openAccount(value.slice('open:'.length));
    } else if (value.startsWith('go:')) showPage(value.slice('go:'.length));
  };

  const moveOnBoard = (items: KanbanItem[]) => {
    const moved = new Map(items.map((item) => [item.id, item]));
    const reordered = items.map((item) => {
      const row = accounts.find((account) => account.id === item.id)!;
      return { ...row, status: item.status as AccountStatus };
    });
    setAccounts([...reordered, ...accounts.filter((row) => !moved.has(row.id))]);
  };

  const opened = accounts.find((row) => row.id === openId);
  const accountsPage = viewState[page];

  return (
    <SidebarProvider
      storageKey={false}
      keyboardShortcut={false}
      className="min-h-0 overflow-hidden rounded-2xl border border-transparent shadow-card md:h-[50rem]"
    >
      <AppSidebar activeItem={page} onNavigate={navigate} navViews={views} onSearch={() => setCommandOpen(true)} />
      <SidebarResizeHandle />
      <div className="relative flex min-w-0 flex-1 flex-col bg-background md:overflow-y-auto">
        {accountsPage ? (
          <PageHeader
            title={accountsPage.title}
            description=""
            // The landing page has its own <h1>, and the dashboard sits under the "Live dashboard" <h2>.
            headingLevel={3}
            leading={<SidebarTrigger />}
            tabs={tabs}
            tab={tab}
            onTabChange={(value) => setTab(value as TabValue)}
            query={query}
            onQueryChange={setQuery}
            filterOptions={filterOptions}
            filters={filters}
            onFiltersChange={setFilters}
            onNew={() => openNew(tab === 'all' ? 'trial' : tab)}
          >
            <div className="flex flex-col gap-4 p-4">
              <StatsOverview />
              <div className="overflow-hidden rounded-2xl border border-transparent bg-card shadow-card">
                <DataTable
                  rows={ownerFiltered}
                  query={query}
                  status={tabStatus[tab]}
                  onOpen={(row) => openAccount(row.id)}
                  onClearFilters={() => {
                    setQuery('');
                    setFilters([]);
                    setTab('all');
                  }}
                />
              </div>
            </div>
          </PageHeader>
        ) : page === 'deals' ? (
          <>
            <div className="flex h-14 items-center gap-2 border-b border-border px-4">
              <SidebarTrigger />
              <h3 className="min-w-0 flex-1 truncate text-title font-medium">Board</h3>
            </div>
            <div className="flex h-[34rem] min-w-0 p-4 md:h-[40rem]">
              <KanbanBoard
                columns={[...columns]}
                items={accounts}
                onItemsChange={moveOnBoard}
                onOpen={(item) => openAccount(item.id)}
                onAdd={(status) => openNew(status as NewItemStatus)}
              />
            </div>
          </>
        ) : (
          <>
            <div className="flex h-14 items-center gap-2 border-b border-border px-4">
              <SidebarTrigger />
              <h3 className="min-w-0 flex-1 truncate text-title font-medium">{pageTitles[page]}</h3>
            </div>
            <Empty className="flex-1 py-16">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Layers />
                </EmptyMedia>
                <EmptyTitle render={<h4 />}>{pageTitles[page]} isn’t part of this demo</EmptyTitle>
                <EmptyDescription>
                  Accounts and its saved views are live. Everything there is built from Kosmos blocks.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button variant="secondary" onClick={(event) => navigate('accounts', event)}>
                  Go to Accounts
                </Button>
              </EmptyContent>
            </Empty>
          </>
        )}
      </div>

      {opened ? (
        <DetailDrawer
          trigger={null}
          open={drawerOpen}
          onOpenChange={setDrawerOpen}
          account={{ ...opened, ...details[opened.id] }}
          onAccountChange={(next) =>
            setAccounts(accounts.map((row) => (row.id === next.id ? { ...row, status: next.status } : row)))
          }
        />
      ) : null}
      <NewItemDialog
        trigger={null}
        open={newOpen}
        onOpenChange={setNewOpen}
        defaultValues={{ status: newStatus, owner: 'maya' }}
        onCreate={create}
      />
      <CommandMenu
        trigger={null}
        hotkey={false}
        open={commandOpen}
        onOpenChange={setCommandOpen}
        groups={commandGroups}
        pages={{}}
        onRun={runCommand}
      />
    </SidebarProvider>
  );
}
