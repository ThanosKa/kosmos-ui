'use client';

import { Home, Inbox, Settings } from 'lucide-react';
import { useState } from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarResizeHandle,
  SidebarTrigger,
} from '@/registry/kosmos/ui/sidebar';

const pages = [
  { label: 'Home', icon: Home },
  { label: 'Inbox', icon: Inbox },
  { label: 'Settings', icon: Settings },
];

export default function SidebarControlled() {
  // Save these two values (a cookie or local storage) to restore the layout on the next visit.
  const [open, setOpen] = useState(true);
  const [width, setWidth] = useState(208);
  const [active, setActive] = useState('Home');
  return (
    <SidebarProvider
      open={open}
      onOpenChange={setOpen}
      width={width}
      onWidthChange={setWidth}
      minWidth={160}
      maxWidth={320}
      mobileBreakpoint={480}
      className="h-72 min-h-0 w-full overflow-hidden rounded-xl border border-transparent shadow-card"
    >
      <Sidebar>
        <SidebarContent render={<nav aria-label="Main" />}>
          <SidebarGroup>
            <SidebarMenu>
              {pages.map(({ label, icon: Icon }) => (
                <SidebarMenuItem key={label}>
                  <SidebarMenuButton
                    href={`/${label.toLowerCase()}`}
                    isActive={active === label}
                    onClick={(event) => {
                      // A demo: stays on this page. In an app, let the link navigate.
                      event.preventDefault();
                      setActive(label);
                    }}
                  >
                    <Icon aria-hidden />
                    <span>{label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <SidebarResizeHandle />
      <SidebarInset render={<div />}>
        <header className="flex h-12 shrink-0 items-center gap-2 border-b border-border px-3">
          <SidebarTrigger />
          <p className="text-body text-muted-foreground tabular-nums">
            {open ? `Open, ${width}px wide` : 'Collapsed'}
          </p>
        </header>
      </SidebarInset>
    </SidebarProvider>
  );
}
