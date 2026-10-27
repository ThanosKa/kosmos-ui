'use client';

import * as React from 'react';
import { AppSidebar } from '@/registry/kosmos/blocks/app-sidebar/app-sidebar';
import { DataTable, sampleProjects, type Project } from '@/registry/kosmos/blocks/data-table/data-table';
import { SidebarInset, SidebarProvider } from '@/registry/kosmos/ui/sidebar';

/** Milliseconds after the page loads: the frame has settled by 1200, then a project signs up, then its trial converts. */
const arrivesAt = 1900;
const convertsAt = 5100;

const newProject: Project = {
  id: 'lumenfield',
  name: 'Lumenfield Health',
  domain: 'lumenfield.example',
  platform: 'web',
  plan: 'pro',
  status: 'trial',
  users: 640,
  events: 18200,
  mrr: 0,
  lastEventAt: '2026-10-11',
};

/**
 * The landing hero's product: the app sidebar and the Projects data table, crisp at its natural size. Once the frame has
 * settled, a new project arrives at the top as a trial and, a few seconds later, converts to Live. It happens once and
 * never loops. Under reduced motion the table opens with both already done.
 */
function LandingHeroProduct() {
  const [rows, setRows] = React.useState<Project[]>(sampleProjects);
  const [arrived, setArrived] = React.useState(false);
  const table = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const settled = window.setTimeout(() => setRows([{ ...newProject, status: 'live', mrr: 149 }, ...sampleProjects]), 0);
      return () => window.clearTimeout(settled);
    }
    const timers = [
      window.setTimeout(() => {
        const row = table.current?.querySelector('tbody tr');
        if (row) table.current?.style.setProperty('--m-row-height', `${row.getBoundingClientRect().height}px`);
        setRows([newProject, ...sampleProjects]);
        setArrived(true);
      }, Math.max(arrivesAt - performance.now(), 0)),
      window.setTimeout(
        () => setRows((current) => current.map((row) => (row.id === newProject.id ? { ...row, status: 'live', mrr: 149 } : row))),
        Math.max(convertsAt - performance.now(), 0),
      ),
    ];
    return () => timers.forEach(window.clearTimeout);
  }, []);

  return (
    <SidebarProvider storageKey={false} keyboardShortcut={false} className="h-full min-h-0">
      <AppSidebar activeItem="projects" onNavigate={(_id, event) => event.preventDefault()} />
      <SidebarInset render={<div />} className="overflow-hidden">
        <header className="flex h-12 shrink-0 items-center border-b border-border px-4">
          <h3 className="truncate text-body font-medium">Projects</h3>
        </header>
        <div ref={table} data-arrived={arrived ? '' : undefined} className="landing-rows p-4 @max-md:p-2">
          <div className="overflow-hidden rounded-2xl border border-transparent bg-card shadow-card">
            <DataTable rows={rows} />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export { LandingHeroProduct };
