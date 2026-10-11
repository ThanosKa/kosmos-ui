'use client';

import { useState } from 'react';
import { AppSidebar } from '@/registry/kosmos/blocks/app-sidebar/app-sidebar';
import { SidebarInset, SidebarProvider, SidebarResizeHandle, SidebarTrigger } from '@/registry/kosmos/ui/sidebar';

const titles: Record<string, string> = {
  home: 'Home',
  inbox: 'Inbox',
  accounts: 'Accounts',
  deals: 'Deals',
  reports: 'Reports',
  'view-enterprise': 'Enterprise accounts',
  'view-renewals': 'Renewals this quarter',
  'view-at-risk': 'At risk',
  help: 'Help and feedback',
  settings: 'Settings',
};

export default function AppSidebarDemo() {
  const [page, setPage] = useState('accounts');

  return (
    // In an app, drop the height and frame classes: the provider fills the screen.
    <SidebarProvider className="h-[36rem] min-h-0 w-full overflow-hidden rounded-xl border border-transparent shadow-card">
      <AppSidebar
        activeItem={page}
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
        <p className="p-4 text-body text-muted-foreground">Pick a page in the sidebar, or drag its edge to resize it.</p>
      </SidebarInset>
    </SidebarProvider>
  );
}
