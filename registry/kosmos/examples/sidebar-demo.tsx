import { BarChart3, Folder, Home, Inbox, Settings, Users } from 'lucide-react';
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
  { label: 'Home', icon: Home, href: '#home', active: true },
  { label: 'Inbox', icon: Inbox, href: '#inbox', count: 12 },
  { label: 'Reports', icon: BarChart3, href: '#reports' },
  { label: 'Customers', icon: Users, href: '#customers' },
];

const projects = ['Q3 Roadmap', 'Billing revamp', 'Onboarding'];

export default function SidebarDemo() {
  return (
    // In an app, drop the height and frame classes: the provider fills the screen.
    <SidebarProvider
      defaultWidth={224}
      minWidth={176}
      mobileBreakpoint={480}
      className="h-[28rem] min-h-0 w-full overflow-hidden rounded-xl border border-transparent shadow-card"
    >
      <Sidebar>
        <SidebarHeader>
          <div className="flex h-8 items-center px-2 text-body font-medium">Acme Inc.</div>
        </SidebarHeader>
        <SidebarContent render={<nav aria-label="Main" />}>
          <SidebarGroup>
            <SidebarMenu>
              {pages.map(({ label, icon: Icon, href, active, count }) => (
                <SidebarMenuItem key={label}>
                  <SidebarMenuButton href={href} isActive={active}>
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
                  <SidebarMenuButton href="#projects">
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
              <SidebarMenuButton href="#settings">
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
          <h1 className="truncate text-body font-medium">Home</h1>
        </header>
        <p className="p-4 text-body text-muted-foreground">Drag the sidebar’s edge to resize it.</p>
      </SidebarInset>
    </SidebarProvider>
  );
}
