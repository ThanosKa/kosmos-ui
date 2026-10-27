'use client';

import type { ReactNode } from 'react';
import { AppSidebar } from '@/registry/kosmos/blocks/app-sidebar/app-sidebar';
import { DataTable, sampleProjects } from '@/registry/kosmos/blocks/data-table/data-table';
import { KanbanBoard } from '@/registry/kosmos/blocks/kanban-board/kanban-board';
import { StatsOverview, type StatsRange } from '@/registry/kosmos/blocks/stats-overview/stats-overview';
import { SidebarInset, SidebarProvider } from '@/registry/kosmos/ui/sidebar';
import { boardAt, boardColumns } from './blocks';
import type { GalleryItem } from '../gallery';
import { Stage } from '../stage';

const ranges: StatsRange[] = ['7d', '30d', '90d'];

function AppScreen({ active, title, children }: { active: string; title: string; children: ReactNode }) {
  return (
    <SidebarProvider defaultOpen={false} storageKey={false} keyboardShortcut={false} className="h-full min-h-0">
      <AppSidebar activeItem={active} onNavigate={(_id, event) => event.preventDefault()} />
      <SidebarInset render={<div />} className="overflow-hidden">
        <header className="flex h-12 shrink-0 items-center gap-2 border-b border-border px-4">
          <h3 className="truncate text-body font-medium">{title}</h3>
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}

/** Four rows all loop long; the last one pauses and resumes, so the table never changes height. */
function projectsAt(tick: number) {
  const paused = tick % 4 >= 2;
  return sampleProjects.slice(0, 4).map((row, index) => (index === 3 && paused ? { ...row, status: 'paused' as const, mrr: 0 } : row));
}

export const projectsCard: GalleryItem = {
  id: 'projects',
  title: 'Projects',
  description: 'The sidebar, a page bar and the data table with everything on.',
  href: '/docs/blocks/data-table',
  stage: (
    <Stage base={640} interval={1100} staticTick={1}>
      {(tick) => (
        <AppScreen active="projects" title="Projects">
          <div className="flex-1 p-4">
            <div className="overflow-hidden rounded-2xl border border-transparent bg-card shadow-card">
              <DataTable rows={projectsAt(tick)} />
            </div>
          </div>
        </AppScreen>
      )}
    </Stage>
  ),
};

export const roadmapCard: GalleryItem = {
  id: 'roadmap',
  title: 'Roadmap',
  description: 'A board where cards move from idea to shipped.',
  href: '/docs/blocks/kanban-board',
  stage: (
    <Stage base={680} interval={1500} staticTick={1}>
      {(tick) => (
        <AppScreen active="roadmap" title="Roadmap">
          <div className="flex min-h-0 flex-1 p-3">
            <KanbanBoard columns={boardColumns} items={boardAt(tick)} onItemsChange={() => {}} />
          </div>
        </AppScreen>
      )}
    </Stage>
  ),
};

export const overviewCard: GalleryItem = {
  id: 'overview',
  title: 'Overview',
  description: 'Headline metrics, the chart and the top events in one page.',
  href: '/docs/blocks/stats-overview',
  stage: (
    <Stage base={640} interval={2400} staticTick={1}>
      {(tick) => (
        <AppScreen active="overview" title="Overview">
          <div className="flex-1 p-3 mask-b-from-[calc(100%-2rem)]">
            <StatsOverview range={ranges[tick % 3]} onRangeChange={() => {}} />
          </div>
        </AppScreen>
      )}
    </Stage>
  ),
};
