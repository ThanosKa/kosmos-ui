'use client';

import { BarChart3, Folder, Home, Inbox, LogOut, Plus, Settings, UserRound } from 'lucide-react';
import { useState, type MouseEvent } from 'react';
import { DropdownMenuItem, DropdownMenuSeparator } from '@/registry/kosmos/ui/dropdown-menu';
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
  SidebarSubmenu,
  SidebarSubmenuButton,
  SidebarSubmenuContent,
  SidebarSubmenuItem,
  SidebarSubmenuTrigger,
  SidebarTrigger,
  SidebarUserMenu,
  SidebarWorkspaceSwitcher,
} from '@/registry/kosmos/ui/sidebar';

// eslint-disable-next-line @next/next/no-img-element
const workspaceLogo = (id: string) => <img src={`/logos/${id}.svg`} alt="" />;

const workspaces = [
  { id: 'acme', name: 'Acme', description: 'Scale plan', logo: workspaceLogo('acme') },
  { id: 'acme-staging', name: 'Acme Staging', description: 'Free plan', logo: workspaceLogo('acme-staging') },
];

const pages = [
  { label: 'Home', icon: Home, href: '/home' },
  { label: 'Inbox', icon: Inbox, href: '/inbox', count: 12 },
];

const reports = ['Revenue', 'Retention', 'Funnels'];

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
      className="h-[32rem] min-h-0 w-full overflow-hidden rounded-xl border border-transparent shadow-card"
    >
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <SidebarWorkspaceSwitcher workspaces={workspaces}>
            <DropdownMenuItem>
              <Plus />
              Add workspace
            </DropdownMenuItem>
          </SidebarWorkspaceSwitcher>
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
              <SidebarMenuItem>
                <SidebarSubmenu label="Reports" defaultOpen>
                  <SidebarSubmenuTrigger isActive={reports.includes(active)}>
                    <BarChart3 aria-hidden />
                    <span>Reports</span>
                  </SidebarSubmenuTrigger>
                  <SidebarSubmenuContent>
                    {reports.map((report) => (
                      <SidebarSubmenuItem key={report}>
                        <SidebarSubmenuButton href={`/reports/${report.toLowerCase()}`} isActive={active === report} onClick={open(report)}>
                          <span>{report}</span>
                        </SidebarSubmenuButton>
                      </SidebarSubmenuItem>
                    ))}
                  </SidebarSubmenuContent>
                </SidebarSubmenu>
              </SidebarMenuItem>
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
          <SidebarUserMenu user={{ name: 'Lena Park', email: 'lena@acme.example', initials: 'LP', avatar: '/avatars/lena.jpg' }}>
            <DropdownMenuItem>
              <UserRound />
              Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <LogOut />
              Log out
            </DropdownMenuItem>
          </SidebarUserMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarResizeHandle />
      <SidebarInset render={<div />}>
        <header className="flex h-12 shrink-0 items-center gap-2 border-b border-border px-3">
          <SidebarTrigger />
          <h1 className="truncate text-body font-medium">{active}</h1>
        </header>
        <p className="p-4 text-body text-muted-foreground">
          Collapse the sidebar to icons with the button, and drag its edge to resize it. In icon mode, Reports opens its
          pages in a popover.
        </p>
      </SidebarInset>
    </SidebarProvider>
  );
}
