'use client';

import * as React from 'react';
import { AppSidebar } from '@/registry/kosmos/blocks/app-sidebar/app-sidebar';
import { AuthForms } from '@/registry/kosmos/blocks/auth-forms/auth-forms';
import { FeatureSection } from '@/registry/kosmos/blocks/feature-section/feature-section';
import { SettingsPage } from '@/registry/kosmos/blocks/settings/settings';
import { StatsOverview } from '@/registry/kosmos/blocks/stats-overview/stats-overview';
import { cn } from '@/registry/kosmos/lib/cn';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/registry/kosmos/ui/sidebar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/registry/kosmos/ui/tabs';

type ShowcaseScreen = {
  /** A stable name for the screen. */
  id: string;
  /** The tab. */
  label: string;
  /** The address the browser bar shows, without a scheme. */
  address: string;
  /** The screen, live. It fills the frame's height and scrolls inside it when taller. */
  content: React.ReactNode;
};

function SampleDashboard() {
  return (
    <SidebarProvider storageKey={false} keyboardShortcut={false} className="h-full min-h-0">
      <AppSidebar activeItem="overview" onNavigate={(_id, event) => event.preventDefault()} />
      <SidebarInset render={<div />} className="overflow-y-auto">
        <header className="flex h-12 shrink-0 items-center gap-2 border-b border-border px-3">
          <SidebarTrigger />
          <h3 className="truncate text-body font-medium">Overview</h3>
        </header>
        <div className="p-4">
          <StatsOverview />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

// Sample data: replace the screens with the blocks and pages of your own product.
const sampleScreens: ShowcaseScreen[] = [
  { id: 'dashboard', label: 'Dashboard', address: 'acme.example/overview', content: <SampleDashboard /> },
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
    id: 'marketing',
    label: 'Marketing',
    address: 'acme.example',
    content: (
      <div className="px-4 py-14 sm:px-6">
        <FeatureSection headingLevel={3} />
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

type ShowcaseProps = Omit<React.ComponentProps<'div'>, 'children'> & {
  /** The screens, one tab each, in order. */
  screens?: ShowcaseScreen[];
  /** Names the row of tabs. */
  label?: string;
  /** The tab shown first. */
  defaultScreen?: string;
};

/**
 * A live product in a browser-style frame, with a tab for each screen: a dashboard, the sign-in, a marketing page,
 * the settings, each a real block you can use. The frame is a fixed height and each screen scrolls inside it. The
 * first screen is in the markup, so it shows before JavaScript loads. Lays itself out by its own width.
 */
function Showcase({ screens = sampleScreens, label = 'Screens', defaultScreen, className, ...props }: ShowcaseProps) {
  const first = defaultScreen ?? screens[0]?.id;
  const [screen, setScreen] = React.useState(first);
  if (screens.length === 0) return null;
  const current = screens.find((item) => item.id === screen) ?? screens[0];

  return (
    <div data-slot="showcase" className={cn('@container', className)} {...props}>
      <Tabs value={current.id} onValueChange={(value) => setScreen(String(value))} className="items-center gap-6">
        <TabsList aria-label={label}>
          {screens.map((item) => (
            <TabsTrigger key={item.id} value={item.id}>
              {item.label}
            </TabsTrigger>
          ))}
        </TabsList>
        <div data-slot="showcase-frame" className="w-full overflow-hidden rounded-2xl border border-transparent bg-card shadow-card">
          <div aria-hidden className="grid h-9 grid-cols-[1fr_auto_1fr] items-center gap-3 border-b border-border px-3.5">
            <span className="flex gap-1.5">
              <span className="size-2.5 rounded-full bg-foreground/15" />
              <span className="size-2.5 rounded-full bg-foreground/15" />
              <span className="size-2.5 rounded-full bg-foreground/15" />
            </span>
            <span className="truncate text-caption text-muted-foreground">{current.address}</span>
          </div>
          {screens.map((item) => (
            <TabsContent
              key={item.id}
              value={item.id}
              className="h-[34rem] overflow-x-hidden overflow-y-auto bg-background transition-[opacity] duration-base starting:opacity-0 @3xl:h-[40rem]"
            >
              {item.content}
            </TabsContent>
          ))}
        </div>
      </Tabs>
    </div>
  );
}

export { Showcase, type ShowcaseProps, type ShowcaseScreen };
