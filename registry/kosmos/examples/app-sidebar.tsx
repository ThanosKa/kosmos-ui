'use client';

import { Layers } from 'lucide-react';
import * as React from 'react';
import { OverlayStage } from '@/components/preview/overlay-stage';
import { PreviewSection, PreviewStack } from '@/components/preview/preview-section';
import { AppSidebar, AppSidebarContent, type AppSidebarProps } from '@/registry/kosmos/blocks/app-sidebar/app-sidebar';
import { Drawer, DrawerContent, DrawerTitle } from '@/registry/kosmos/ui/drawer';
import {
  SidebarInset,
  SidebarProvider,
  SidebarResizeHandle,
  SidebarTrigger,
  useSidebar,
} from '@/registry/kosmos/ui/sidebar';

const frame = 'min-h-0 overflow-hidden rounded-xl border border-transparent shadow-card';

function Page({ title }: { title: string }) {
  return (
    <SidebarInset>
      <header className="flex h-12 shrink-0 items-center gap-2 border-b border-border px-3">
        <SidebarTrigger />
        <h1 className="truncate text-body font-medium">{title}</h1>
      </header>
      <p className="p-4 text-body text-muted-foreground">Page content</p>
    </SidebarInset>
  );
}

/** Pins a menu open from 768px up; below that the sidebar is a closed drawer and the menu has no trigger. */
function PinnedSidebar({ menu }: { menu: 'workspace' | 'user' }) {
  const { isMobile } = useSidebar();
  const pinned = isMobile ? undefined : { open: true, modal: false };
  return (
    <AppSidebar
      searchShortcut
      onAction={() => {}}
      workspaceMenu={menu === 'workspace' ? pinned : undefined}
      userMenu={menu === 'user' ? pinned : undefined}
    />
  );
}

/** Scrolls the sidebar content of its frame halfway, so both edges show the fade. */
function ScrollSidebarToMiddle() {
  const ref = React.useRef<HTMLSpanElement>(null);
  React.useEffect(() => {
    const viewport = ref.current
      ?.closest('[data-slot=sidebar-wrapper]')
      ?.querySelector<HTMLElement>('[data-slot=sidebar-content] [data-slot=scroll-area-viewport]');
    if (!viewport) return;
    const scroll = () => {
      viewport.scrollTop = (viewport.scrollHeight - viewport.clientHeight) / 2;
    };
    scroll();
    const observer = new ResizeObserver(scroll);
    observer.observe(viewport);
    const stop = setTimeout(() => observer.disconnect(), 1000);
    return () => {
      clearTimeout(stop);
      observer.disconnect();
    };
  }, []);
  return <span ref={ref} aria-hidden className="hidden" />;
}

/** Every frame keeps its own state: none saves it or listens for the shortcut, so one ⌘B never flips them all. */
function Shell({
  className,
  title = 'Projects',
  children,
  ...props
}: React.ComponentProps<typeof SidebarProvider> & { title?: string }) {
  return (
    <SidebarProvider storageKey={false} keyboardShortcut={false} className={`${frame} ${className ?? ''}`} {...props}>
      {children}
      <SidebarResizeHandle />
      <Page title={title} />
    </SidebarProvider>
  );
}

const longNames: Pick<AppSidebarProps, 'workspaces' | 'user' | 'navViews'> = {
  workspaces: [{ id: 'parallax-eu', name: 'Parallax Europe Data Region Workspace', plan: 'Scale plan, billed yearly in euros' }],
  user: { name: 'Tomás Ortega Villanueva de la Fuente', email: 'tomas.ortega.villanueva@parallax.example', initials: 'TO' },
  navViews: [
    { id: 'view-scale-ios', label: 'Scale plan projects on iOS with more than 10,000 users', href: '#view-scale-ios', icon: Layers },
    { id: 'view-trials', label: 'Trials', href: '#view-trials', icon: Layers, badge: 1280, badgeLabel: 'projects' },
  ],
};

export default function AppSidebarPreview() {
  return (
    <PreviewStack>
      <PreviewSection title="Expanded, with each menu open (a drawer below 768px)">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Shell className="h-40 md:h-[38rem]">
            <PinnedSidebar menu="workspace" />
          </Shell>
          <Shell className="h-40 md:h-[38rem]">
            <PinnedSidebar menu="user" />
          </Shell>
        </div>
      </PreviewSection>

      <PreviewSection title="Collapsed to icons, the default; offcanvas hides it at the edge">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Shell defaultOpen={false} className="h-40 md:h-[38rem]">
            <AppSidebar searchShortcut onAction={() => {}} />
          </Shell>
          <Shell defaultOpen={false} className="h-40">
            <AppSidebar collapsible="offcanvas" />
          </Shell>
        </div>
      </PreviewSection>

      <PreviewSection title="Content taller than the frame, scrolled halfway: both edges fade">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Shell className="h-40 md:h-[26rem]">
            <AppSidebar searchShortcut onAction={() => {}} />
            <ScrollSidebarToMiddle />
          </Shell>
          <Shell defaultOpen={false} className="h-40 md:h-[26rem]">
            <AppSidebar searchShortcut onAction={() => {}} />
            <ScrollSidebarToMiddle />
          </Shell>
        </div>
      </PreviewSection>

      <PreviewSection title="Long names and a count in the thousands">
        <Shell className="h-40 md:h-[38rem]" title="Scale plan projects on iOS with more than 10,000 users">
          <AppSidebar activeItem="view-scale-ios" onAction={() => {}} {...longNames} />
        </Shell>
      </PreviewSection>

      <PreviewSection title="No workspaces, no actions, no shortcut: no switcher, the user as plain text">
        <Shell className="h-40 md:h-[38rem]">
          <AppSidebar workspaces={[]} />
        </Shell>
      </PreviewSection>

      <PreviewSection title="Phone: the sidebar as a drawer">
        <OverlayStage label="open, below 768px" className="h-[40rem] max-w-sm">
          {(container) => (
            <Drawer open modal={false} swipeDirection="left">
              <DrawerContent
                container={container}
                initialFocus={false}
                showCloseButton={false}
                className="bg-sidebar text-sidebar-foreground data-[swipe-direction=left]:w-72 data-[swipe-direction=left]:max-w-[calc(100%-1rem)] sm:data-[swipe-direction=left]:w-72"
              >
                <DrawerTitle className="sr-only">Main navigation</DrawerTitle>
                <div className="flex min-h-0 flex-1 flex-col">
                  <AppSidebarContent searchShortcut onAction={() => {}} />
                </div>
              </DrawerContent>
            </Drawer>
          )}
        </OverlayStage>
      </PreviewSection>
    </PreviewStack>
  );
}
