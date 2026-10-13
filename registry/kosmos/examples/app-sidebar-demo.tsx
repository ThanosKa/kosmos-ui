'use client';

import { useState } from 'react';
import { AppSidebar, type AppSidebarAction } from '@/registry/kosmos/blocks/app-sidebar/app-sidebar';
import { SidebarInset, SidebarProvider, SidebarResizeHandle, SidebarTrigger } from '@/registry/kosmos/ui/sidebar';

const titles: Record<string, string> = {
  overview: 'Overview',
  projects: 'Projects',
  events: 'Events',
  users: 'Users',
  revenue: 'Revenue',
  roadmap: 'Roadmap',
  'view-scale': 'Scale plan',
  'view-trials': 'Trials',
  help: 'Help and feedback',
  settings: 'Settings',
};

const actionLabels: Record<AppSidebarAction, string> = {
  'add-workspace': 'add workspace',
  profile: 'profile',
  preferences: 'preferences',
  'log-out': 'log out',
};

export default function AppSidebarDemo() {
  const [page, setPage] = useState('projects');
  const [action, setAction] = useState<AppSidebarAction | null>(null);

  return (
    // In an app, drop the height and frame classes: the provider fills the screen.
    <SidebarProvider
      storageKey="app-sidebar"
      className="h-[36rem] min-h-0 w-full overflow-hidden rounded-xl border border-transparent shadow-card"
    >
      <AppSidebar
        activeItem={page}
        onAction={setAction}
        onNavigate={(id, event) => {
          event.preventDefault();
          setPage(id);
        }}
      />
      <SidebarResizeHandle />
      <SidebarInset>
        <header className="flex h-12 shrink-0 items-center gap-2 border-b border-border px-3">
          <SidebarTrigger />
          <h1 className="truncate text-body font-medium">{titles[page]}</h1>
        </header>
        <p className="p-4 text-body text-muted-foreground">
          Pick a page in the sidebar or drag its edge to resize it. The button beside the title, or the shortcut in its
          tooltip, collapses it to icons, and it stays that way when you come back.
          {action ? ` Last menu action: ${actionLabels[action]}.` : ''}
        </p>
      </SidebarInset>
    </SidebarProvider>
  );
}
