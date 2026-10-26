'use client';

import * as React from 'react';
import { AppSidebar } from '@/registry/kosmos/blocks/app-sidebar/app-sidebar';
import { AuthForms } from '@/registry/kosmos/blocks/auth-forms/auth-forms';
import { DataTable, sampleProjects, type DataTableAction, type Project } from '@/registry/kosmos/blocks/data-table/data-table';
import { KanbanBoard } from '@/registry/kosmos/blocks/kanban-board/kanban-board';
import { SettingsPage } from '@/registry/kosmos/blocks/settings/settings';
import { Showcase, type ShowcaseScreen } from '@/registry/kosmos/blocks/showcase/showcase';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/registry/kosmos/ui/sidebar';

/** A product screen: the app sidebar, a page bar with the title, and the page under it. */
function AppScreen({ active, title, children }: { active: string; title: string; children: React.ReactNode }) {
  return (
    <SidebarProvider storageKey={false} keyboardShortcut={false} className="h-full min-h-0">
      <AppSidebar activeItem={active} onNavigate={(_id, event) => event.preventDefault()} />
      <SidebarInset render={<div />} className="overflow-hidden">
        <header className="flex h-12 shrink-0 items-center gap-2 border-b border-border px-3">
          <SidebarTrigger />
          <h3 className="truncate text-body font-medium">{title}</h3>
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}

/**
 * The data table in full: search, the Plan, Platform and Status filters, column menus, row selection and the bulk bar.
 * Its actions change the rows, so Pause, Resume and Delete do what they say.
 */
function ProjectsScreen() {
  const [rows, setRows] = React.useState<Project[]>(sampleProjects);
  const [selection, setSelection] = React.useState<string[]>(['saltmarsh', 'driftwood']);

  const run = (action: DataTableAction, affected: Project[]) => {
    const ids = new Set(affected.map((row) => row.id));
    if (action === 'delete') {
      setRows((current) => current.filter((row) => !ids.has(row.id)));
      setSelection((current) => current.filter((id) => !ids.has(id)));
    } else if (action === 'pause' || action === 'resume') {
      const status = action === 'pause' ? 'paused' : 'live';
      setRows((current) => current.map((row) => (ids.has(row.id) ? { ...row, status } : row)));
    }
  };

  return (
    <AppScreen active="projects" title="Projects">
      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        <div className="overflow-hidden rounded-2xl border border-transparent bg-card shadow-card">
          <DataTable rows={rows} selection={selection} onSelectionChange={setSelection} onAction={run} />
        </div>
      </div>
    </AppScreen>
  );
}

function RoadmapScreen() {
  return (
    <AppScreen active="roadmap" title="Roadmap">
      <div className="flex min-h-0 min-w-0 flex-1 p-4">
        <KanbanBoard />
      </div>
    </AppScreen>
  );
}

const screens: ShowcaseScreen[] = [
  { id: 'dashboard', label: 'Dashboard', address: 'acme.example/projects', content: <ProjectsScreen /> },
  { id: 'roadmap', label: 'Roadmap', address: 'acme.example/roadmap', content: <RoadmapScreen /> },
  {
    id: 'auth',
    label: 'Auth',
    address: 'acme.example/login',
    content: (
      <div className="flex min-h-full items-center justify-center p-6">
        <AuthForms headingLevel={3} />
      </div>
    ),
  },
  {
    id: 'settings',
    label: 'Settings',
    address: 'acme.example/settings',
    content: (
      <div className="p-4 sm:p-6">
        <SettingsPage headingLevel={3} />
      </div>
    ),
  },
];

/** The landing's showcase: whole screens in a browser frame, the Dashboard tab the data table with everything on. */
export function LandingShowcase() {
  return <Showcase screens={screens} />;
}
