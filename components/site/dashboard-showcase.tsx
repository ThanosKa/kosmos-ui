'use client';

import { Activity, CircleDollarSign, FolderKanban, Layers, LayoutDashboard, Milestone, Plus, Settings, UserPlus, Users } from 'lucide-react';
import * as React from 'react';
import { AppSidebar, type AppSidebarNavItem } from '@/registry/kosmos/blocks/app-sidebar/app-sidebar';
import { CommandMenu, type CommandMenuGroup } from '@/registry/kosmos/blocks/command-menu/command-menu';
import { DataTable, sampleProjects, type Project, type ProjectStatus } from '@/registry/kosmos/blocks/data-table/data-table';
import { DetailDrawer, sampleProject, type DetailProject } from '@/registry/kosmos/blocks/detail-drawer/detail-drawer';
import { KanbanBoard, sampleRoadmapItems, type KanbanPerson, type KanbanTag } from '@/registry/kosmos/blocks/kanban-board/kanban-board';
import { NewItemDialog, type NewItemValues } from '@/registry/kosmos/blocks/new-item-dialog/new-item-dialog';
import { PageHeader, type PageTab } from '@/registry/kosmos/blocks/page-header/page-header';
import { StatsOverview } from '@/registry/kosmos/blocks/stats-overview/stats-overview';
import { Button } from '@/registry/kosmos/ui/button';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/registry/kosmos/ui/empty';
import { SidebarProvider, SidebarResizeHandle, SidebarTrigger } from '@/registry/kosmos/ui/sidebar';

/*
 * The live dashboard of the landing page, composed from the eight free blocks. It renders as a whole app in its own
 * document (`/dashboard`), which the landing shows in an iframe, so the tokens a visitor picks there stay inside it.
 * The Overview page is the stats overview's Parallax sample data, and the board is the Parallax roadmap, where the new
 * item dialog adds its cards. The table, the drawer and the command menu share the data table's sample projects, so a
 * change in one shows in the others. Only Overview, Projects, its saved views and the roadmap are wired up; the other
 * pages say so and link back. The Parallax team doesn't add its customers' projects, so the Projects page has no
 * primary action: every new item is a roadmap item.
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

/** The dialog names areas and people by id; the board's cards carry the tag and the person. */
const roadmapAreas: Record<string, KanbanTag> = {
  insights: { label: 'Insights', hue: 'amber' },
  ingestion: { label: 'Ingestion', hue: 'green' },
  billing: { label: 'Billing', hue: 'red' },
  platform: { label: 'Platform', hue: 'blue' },
};
const roadmapTeam: Record<string, KanbanPerson> = {
  lena: { name: 'Lena Park', initials: 'LP' },
  tomas: { name: 'Tomás Ortega', initials: 'TO' },
  ama: { name: 'Ama Mensah', initials: 'AM' },
  kai: { name: 'Kai Nakamura', initials: 'KN' },
};

const statusDot: Record<ProjectStatus, string> = {
  live: 'bg-success',
  trial: 'bg-muted-foreground',
  paused: 'bg-warning',
};

/** What each saved view sets on the Projects page. */
const viewState: Record<string, { title: string; tab: TabValue; filters: string[] }> = {
  projects: { title: 'Projects', tab: 'all', filters: [] },
  'view-scale': { title: 'Scale plan', tab: 'all', filters: ['scale'] },
  'view-trials': { title: 'Trials', tab: 'trial', filters: [] },
};

const pageTitles: Record<string, string> = {
  events: 'Events',
  users: 'Users',
  revenue: 'Revenue',
  help: 'Help and feedback',
  settings: 'Settings',
};

const goTo = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'projects', label: 'Projects', icon: FolderKanban },
  { id: 'events', label: 'Events', icon: Activity },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'revenue', label: 'Revenue', icon: CircleDollarSign },
  { id: 'roadmap', label: 'Roadmap', icon: Milestone },
  { id: 'settings', label: 'Settings', icon: Settings },
];

const slug = (name: string) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'item';

/** The bar on top of a page that has no page header: the sidebar toggle, the page title and an optional action. */
function PageBar({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="flex h-14 shrink-0 items-center gap-2 border-b border-border px-4">
      <SidebarTrigger />
      <h1 className="min-w-0 flex-1 truncate text-title font-medium">{title}</h1>
      {children}
    </div>
  );
}

export function DashboardShowcase({
  page: pageProp,
  defaultPage = 'overview',
  onPageChange,
  className,
}: {
  /** The page shown, a sidebar item id. Use with `onPageChange`. */
  page?: string;
  defaultPage?: string;
  onPageChange?: (page: string) => void;
  className?: string;
}) {
  const [projects, setProjects] = React.useState<Project[]>(sampleProjects);
  const [ownPage, setOwnPage] = React.useState(defaultPage);
  const page = pageProp ?? ownPage;
  const setPage = (next: string) => {
    setOwnPage(next);
    onPageChange?.(next);
  };
  const [tab, setTab] = React.useState<TabValue>('all');
  const [query, setQuery] = React.useState('');
  const [filters, setFilters] = React.useState<string[]>([]);
  // The drawer keeps showing the last project while it closes, so `openId` outlives `drawerOpen`.
  const [openId, setOpenId] = React.useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [newOpen, setNewOpen] = React.useState(false);
  const [roadmap, setRoadmap] = React.useState(sampleRoadmapItems);
  const [newStage, setNewStage] = React.useState('ideas');
  const [commandOpen, setCommandOpen] = React.useState(false);

  const showPage = (id: string) => {
    setPage(id);
    applyView(id);
  };
  // A page switched from outside (the landing's screen tabs) resets its saved view the same way.
  const applyView = (id: string) => {
    const preset = viewState[id];
    if (preset) {
      setTab(preset.tab);
      setFilters(preset.filters);
      setQuery('');
    }
  };
  const [shownPage, setShownPage] = React.useState(page);
  if (shownPage !== page) {
    setShownPage(page);
    applyView(page);
  }
  const navigate = (id: string, event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault();
    showPage(id);
  };

  const openProject = (id: string) => {
    setOpenId(id);
    setDrawerOpen(true);
  };

  // Every new item lands on the roadmap, so opening the dialog from another page shows the board behind it.
  const openNew = (stage: string) => {
    showPage('roadmap');
    setNewStage(stage);
    setNewOpen(true);
  };

  const create = (values: NewItemValues) => {
    const base = slug(values.title);
    const id = roadmap.some((item) => item.id === base) ? `${base}-${roadmap.length}` : base;
    const item = {
      id,
      title: values.title,
      column: values.stage,
      area: values.area ? roadmapAreas[values.area] : undefined,
      votes: 0,
      assignee: values.assignee ? roadmapTeam[values.assignee] : undefined,
      target: values.target ?? undefined,
    };
    // A new card goes to the top of its column.
    const first = roadmap.findIndex((card) => card.column === item.column);
    setRoadmap(first < 0 ? [...roadmap, item] : [...roadmap.slice(0, first), item, ...roadmap.slice(first)]);
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
    {
      value: 'Actions',
      items: [
        { value: 'new-roadmap-item', label: 'New roadmap item', icon: Plus },
        { value: 'invite', label: 'Invite teammate', icon: UserPlus },
      ],
    },
    { value: 'Go to', items: goTo.map((item) => ({ value: `go:${item.id}`, label: item.label, icon: item.icon })) },
  ];

  const runCommand = (value: string) => {
    if (value === 'new-roadmap-item') openNew('ideas');
    else if (value === 'invite') showPage('settings');
    else if (value.startsWith('open:')) {
      showPage('projects');
      openProject(value.slice('open:'.length));
    } else if (value.startsWith('go:')) showPage(value.slice('go:'.length));
  };

  const opened = projects.find((row) => row.id === openId);
  const listPage = viewState[page];

  return (
    <SidebarProvider storageKey={false} keyboardShortcut={false} className={className}>
      <AppSidebar activeItem={page} onNavigate={navigate} navViews={views} onSearch={() => setCommandOpen(true)} />
      <SidebarResizeHandle />
      <main className="relative flex min-w-0 flex-1 flex-col bg-background">
        {page === 'overview' ? (
          <>
            <PageBar title="Overview" />
            <div className="p-4">
              <StatsOverview />
            </div>
          </>
        ) : listPage ? (
          <PageHeader
            title={listPage.title}
            description=""
            leading={<SidebarTrigger />}
            tabs={tabs}
            tab={tab}
            onTabChange={(value) => setTab(value as TabValue)}
            query={query}
            onQueryChange={setQuery}
            filters={filters}
            onFiltersChange={setFilters}
          >
            <div className="p-4">
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
        ) : page === 'roadmap' ? (
          <>
            <PageBar title="Roadmap">
              <Button variant="primary" onClick={() => openNew('ideas')}>
                <Plus aria-hidden data-icon="inline-start" />
                New roadmap item
              </Button>
            </PageBar>
            {/* The board fills the rest of the screen and scrolls inside its columns. */}
            <div className="flex h-[calc(100svh-3.5rem)] min-h-96 min-w-0 p-4">
              <KanbanBoard items={roadmap} onItemsChange={setRoadmap} onAdd={openNew} />
            </div>
          </>
        ) : (
          <>
            <PageBar title={pageTitles[page]} />
            <Empty className="flex-1 py-16">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Layers />
                </EmptyMedia>
                <EmptyTitle render={<h2 />}>{pageTitles[page]} isn’t part of this demo</EmptyTitle>
                <EmptyDescription>
                  Overview, Projects, its saved views and the roadmap are live. Everything there is built from Kosmos blocks.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button variant="secondary" onClick={(event) => navigate('overview', event)}>
                  Go to Overview
                </Button>
              </EmptyContent>
            </Empty>
          </>
        )}
      </main>

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
        defaultValues={{ stage: newStage }}
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
