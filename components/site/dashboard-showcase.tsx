'use client';

import { BarChart3, Building2, Handshake, Home, Inbox, Layers, Plus, Settings } from 'lucide-react';
import * as React from 'react';
import { AppSidebar, type AppSidebarNavItem } from '@/registry/kosmos/blocks/app-sidebar/app-sidebar';
import { CommandMenu, type CommandMenuGroup } from '@/registry/kosmos/blocks/command-menu/command-menu';
import { DataTable, sampleProjects, type Project, type ProjectStatus } from '@/registry/kosmos/blocks/data-table/data-table';
import { DetailDrawer, sampleProject, type DetailProject } from '@/registry/kosmos/blocks/detail-drawer/detail-drawer';
import { KanbanBoard, type KanbanItem } from '@/registry/kosmos/blocks/kanban-board/kanban-board';
import { NewItemDialog, type NewItemStatus, type NewItemValues } from '@/registry/kosmos/blocks/new-item-dialog/new-item-dialog';
import { PageHeader, type PageTab } from '@/registry/kosmos/blocks/page-header/page-header';
import { StatsOverview } from '@/registry/kosmos/blocks/stats-overview/stats-overview';
import { Button } from '@/registry/kosmos/ui/button';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/registry/kosmos/ui/empty';
import { SidebarProvider, SidebarResizeHandle, SidebarTrigger } from '@/registry/kosmos/ui/sidebar';

/*
 * The live dashboard on the landing page, composed from the eight free blocks. The stats overview shows its
 * Parallax sample data; the table, the board, the drawer and the command menu share the data table's sample
 * projects, so a change in one shows in the others. Only the list page, its saved views and the board are
 * wired up; the other pages say so and link back.
 */

/** What the drawer shows beyond the table's columns, for the projects that have it. */
const details: Record<string, Pick<DetailProject, 'meta' | 'trend' | 'notes' | 'activity'>> = {
  [sampleProject.id]: {
    meta: sampleProject.meta,
    trend: sampleProject.trend,
    notes: sampleProject.notes,
    activity: sampleProject.activity,
  },
};

type TabValue = 'all' | ProjectStatus;

const columns = [
  { id: 'trial', title: 'Trial', tone: 'muted' },
  { id: 'live', title: 'Live', tone: 'success' },
  { id: 'paused', title: 'Paused', tone: 'warning' },
] as const;

const statusDot: Record<ProjectStatus, string> = {
  live: 'bg-success',
  trial: 'bg-muted-foreground',
  paused: 'bg-warning',
};

/** What each saved view sets on the Projects page. */
const viewState: Record<string, { title: string; tab: TabValue; filters: string[] }> = {
  accounts: { title: 'Projects', tab: 'all', filters: [] },
  'view-scale': { title: 'Scale plan', tab: 'all', filters: ['scale'] },
  'view-trials': { title: 'Trials', tab: 'trial', filters: [] },
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
    .replace(/^-|-$/g, '') || 'project';

export function DashboardShowcase() {
  const [projects, setProjects] = React.useState<Project[]>(sampleProjects);
  const [page, setPage] = React.useState('accounts');
  const [tab, setTab] = React.useState<TabValue>('all');
  const [query, setQuery] = React.useState('');
  const [filters, setFilters] = React.useState<string[]>([]);
  // The drawer keeps showing the last project while it closes, so `openId` outlives `drawerOpen`.
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

  const openProject = (id: string) => {
    setOpenId(id);
    setDrawerOpen(true);
  };

  const openNew = (status: NewItemStatus) => {
    setNewStatus(status);
    setNewOpen(true);
  };

  const create = (values: NewItemValues) => {
    const base = slug(values.name);
    const id = projects.some((row) => row.id === base) ? `${base}-${projects.length}` : base;
    setProjects([
      {
        id,
        name: values.name,
        domain: values.domain,
        platform: 'web',
        plan: 'free',
        status: 'trial',
        users: 0,
        events: 0,
        mrr: 0,
        lastEventAt: '2026-10-11',
      },
      ...projects,
    ]);
  };

  const tabs: PageTab[] = [
    { value: 'all', label: 'All', count: projects.length },
    { value: 'live', label: 'Live', count: projects.filter((row) => row.status === 'live').length },
    { value: 'trial', label: 'Trial', count: projects.filter((row) => row.status === 'trial').length },
    { value: 'paused', label: 'Paused', count: projects.filter((row) => row.status === 'paused').length },
  ];

  const views: AppSidebarNavItem[] = [
    { id: 'view-scale', label: 'Scale plan', href: '#view-scale', icon: Layers },
    { id: 'view-trials', label: 'Trials', href: '#view-trials', icon: Layers, badge: tabs[2].count, badgeLabel: 'projects' },
  ];

  const commandGroups: CommandMenuGroup[] = [
    {
      value: 'Projects',
      items: projects.map((row) => ({
        value: `open:${row.id}`,
        label: `${row.name} ${row.domain}`,
        title: row.name,
        hint: row.domain,
        dot: statusDot[row.status],
      })),
    },
    { value: 'Actions', items: [{ value: 'new-project', label: 'New project', icon: Plus }] },
    { value: 'Go to', items: goTo.map((item) => ({ value: `go:${item.id}`, label: item.label, icon: item.icon })) },
  ];

  const runCommand = (value: string) => {
    if (value === 'new-project') openNew('trial');
    else if (value.startsWith('open:')) {
      showPage('accounts');
      openProject(value.slice('open:'.length));
    } else if (value.startsWith('go:')) showPage(value.slice('go:'.length));
  };

  const moveOnBoard = (items: KanbanItem[]) => {
    const moved = new Map(items.map((item) => [item.id, item]));
    const reordered = items.map((item) => {
      const row = projects.find((project) => project.id === item.id)!;
      return { ...row, status: item.status as ProjectStatus };
    });
    setProjects([...reordered, ...projects.filter((row) => !moved.has(row.id))]);
  };

  const opened = projects.find((row) => row.id === openId);
  const listPage = viewState[page];

  return (
    <SidebarProvider className="min-h-0 overflow-hidden rounded-2xl border border-transparent shadow-card md:h-[50rem]">
      <AppSidebar activeItem={page} onNavigate={navigate} navViews={views} onSearch={() => setCommandOpen(true)} />
      <SidebarResizeHandle />
      <div className="relative flex min-w-0 flex-1 flex-col bg-background md:overflow-y-auto">
        {listPage ? (
          <PageHeader
            title={listPage.title}
            description=""
            // The landing page has its own <h1>, and the dashboard sits under the "Live dashboard" <h2>.
            headingLevel={3}
            leading={<SidebarTrigger />}
            tabs={tabs}
            tab={tab}
            onTabChange={(value) => setTab(value as TabValue)}
            query={query}
            onQueryChange={setQuery}
            filters={filters}
            onFiltersChange={setFilters}
            onNew={() => openNew('trial')}
          >
            <div className="flex flex-col gap-4 p-4">
              <StatsOverview />
              <div className="overflow-hidden rounded-2xl border border-transparent bg-card shadow-card">
                <DataTable
                  rows={projects}
                  query={query}
                  status={tab}
                  filters={filters}
                  onOpen={(row) => openProject(row.id)}
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
                items={projects}
                onItemsChange={moveOnBoard}
                onOpen={(item) => openProject(item.id)}
                onAdd={() => openNew('trial')}
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
                  Projects and its saved views are live. Everything there is built from Kosmos blocks.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button variant="secondary" onClick={(event) => navigate('accounts', event)}>
                  Go to Projects
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
          project={{ ...opened, ...details[opened.id] }}
          onProjectChange={(next) =>
            setProjects(projects.map((row) => (row.id === next.id ? { ...row, status: next.status } : row)))
          }
        />
      ) : null}
      <NewItemDialog
        trigger={null}
        open={newOpen}
        onOpenChange={setNewOpen}
        defaultValues={{ status: newStatus }}
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
