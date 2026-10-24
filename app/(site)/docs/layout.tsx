import { DocsMenuButton } from '@/components/docs/docs-menu-button';
import { DocsSidebar } from '@/components/docs/docs-sidebar';
import { SiteHeader } from '@/components/site/site-header';
import { SkipLink } from '@/components/site/skip-link';
import { getDocsNav } from '@/lib/docs-nav';
import { SidebarInset, SidebarProvider } from '@/registry/kosmos/ui/sidebar';

export default function Layout({ children }: LayoutProps<'/docs'>) {
  return (
    // The header is 3.5rem tall and sticky, so the docked sidebar sticks below it.
    <SidebarProvider
      storageKey={false}
      keyboardShortcut={false}
      className="flex-col [&_[data-slot=sidebar-inner]]:top-14 [&_[data-slot=sidebar-inner]]:h-[calc(100svh-3.5rem)]"
    >
      <SkipLink />
      <SiteHeader fullWidth menu={<DocsMenuButton className="md:hidden" />} />
      <div className="flex flex-1">
        <DocsSidebar nav={getDocsNav()} />
        <SidebarInset id="content" tabIndex={-1} className="outline-none">
          {children}
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
