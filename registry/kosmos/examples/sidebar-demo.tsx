'use client';

import { BarChart3, Folder, Home, Inbox, Settings, Users } from 'lucide-react';
import { useState, type MouseEvent } from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarResizeHandle,
  SidebarTrigger,
} from '@/registry/kosmos/ui/sidebar';

const pages = [
  { label: 'Home', icon: Home, href: '/home' },
  { label: 'Inbox', icon: Inbox, href: '/inbox', count: 12 },
  { label: 'Reports', icon: BarChart3, href: '/reports' },
  { label: 'Customers', icon: Users, href: '/customers' },
];

const projects = ['Q3 Roadmap', 'Billing revamp', 'Onboarding'];

export default function SidebarDemo() {
  const [active, setActive] = useState('Home');
  // A demo: links stay on this page. In an app, let them navigate and set `isActive` from the current route.
  const open = (page: string) => (event: MouseEvent) => {
    event.preventDefault();
    setActive(page);
  };
  return (
    // In an app, drop the height and frame classes: the provider fills the screen.
    <SidebarProvider
      defaultWidth={224}
      minWidth={176}
      mobileBreakpoint={480}
      className="h-[28rem] min-h-0 w-full overflow-hidden rounded-xl border border-transparent shadow-card"
    >
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <div className="flex h-8 items-center gap-2 px-1.5">
            <span aria-hidden className="flex size-5 shrink-0 items-center justify-center rounded-md bg-primary text-caption font-medium text-primary-foreground">
              A
            </span>
            <span className="truncate text-body font-medium transition-[opacity] group-data-[collapsible=icon]/sidebar:opacity-0">Acme Inc.</span>
          </div>
        </SidebarHeader>
        <SidebarContent render={<nav aria-label="Main" />}>
          <SidebarGroup>
            <SidebarMenu>
              {pages.map(({ label, icon: Icon, href, count }) => (
                <SidebarMenuItem key={label}>
                  <SidebarMenuButton href={href} isActive={active === label} tooltip={label} onClick={open(label)}>
                    <Icon aria-hidden />
                    <span>{label}</span>
                    {count ? <SidebarMenuBadge>{count}</SidebarMenuBadge> : null}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupLabel>Projects</SidebarGroupLabel>
            <SidebarMenu>
              {projects.map((project) => (
                <SidebarMenuItem key={project}>
                  <SidebarMenuButton href="/projects" isActive={active === project} tooltip={project} onClick={open(project)}>
                    <Folder aria-hidden />
                    <span>{project}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton href="/settings" isActive={active === 'Settings'} tooltip="Settings" onClick={open('Settings')}>
                <Settings aria-hidden />
                <span>Settings</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarResizeHandle />
      <SidebarInset render={<div />}>
        <header className="flex h-12 shrink-0 items-center gap-2 border-b border-border px-3">
          <SidebarTrigger />
          <h1 className="truncate text-body font-medium">{active}</h1>
        </header>
        <p className="p-4 text-body text-muted-foreground">Collapse the sidebar to icons with the button, and drag its edge to resize it.</p>
      </SidebarInset>
    </SidebarProvider>
  );
}
