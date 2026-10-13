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
 * The live dashboard on the landing page, composed from the eight free blocks. The stats overview shows its
 * Parallax sample data, and the board is the Parallax roadmap, where the new item dialog adds its cards. The table,
 * the drawer and the command menu share the data table's sample projects, so a change in one shows in the others.
 * Only the Projects page, its saved views and the roadmap are wired up; the other pages say so and link back. The
 * Parallax team doesn't add its customers' projects, so the Projects page has no primary action: every new item is a
 * roadmap item.
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
  overview: 'Overview',
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

export function DashboardShowcase() {
  const [projects, setProjects] = React.useState<Project[]>(sampleProjects);
  const [page, setPage] = React.useState('projects');
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
    <SidebarProvider
      storageKey={false}
      keyboardShortcut={false}
      className="min-h-0 overflow-hidden rounded-2xl border border-transparent shadow-card md:h-[50rem]"
    >
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
        ) : page === 'roadmap' ? (
          <>
            <div className="flex h-14 items-center gap-2 border-b border-border px-4">
              <SidebarTrigger />
              <h3 className="min-w-0 flex-1 truncate text-title font-medium">Roadmap</h3>
              <Button variant="primary" onClick={() => openNew('ideas')}>
                <Plus aria-hidden data-icon="inline-start" />
                New roadmap item
              </Button>
            </div>
            <div className="flex h-[34rem] min-w-0 p-4 md:h-[40rem]">
              <KanbanBoard items={roadmap} onItemsChange={setRoadmap} onAdd={openNew} />
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
                  Projects, its saved views and the roadmap are live. Everything there is built from Kosmos blocks.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button variant="secondary" onClick={(event) => navigate('projects', event)}>
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
