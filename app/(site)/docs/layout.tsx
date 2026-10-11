import type { Node, Root } from 'fumadocs-core/page-tree';
import { DocsMenuButton } from '@/components/docs/docs-menu-button';
import { DocsSidebar, type DocsSidebarItem, type DocsSidebarSection } from '@/components/docs/docs-sidebar';
import { SiteHeader } from '@/components/site/site-header';
import { SkipLink } from '@/components/site/skip-link';
import { source } from '@/lib/source';
import { SidebarInset, SidebarProvider } from '@/registry/kosmos/ui/sidebar';

/** The page tree as sidebar sections: each separator starts a labelled section, and a folder lists its index page and pages. */
function sidebarSections(tree: Root): DocsSidebarSection[] {
  const sections: DocsSidebarSection[] = [{ items: [] }];
  const pagesOf = (node: Node): DocsSidebarItem[] => {
    if (node.type === 'page') return [{ name: node.name, url: node.url }];
    if (node.type === 'folder') return [...(node.index ? pagesOf(node.index) : []), ...node.children.flatMap(pagesOf)];
    return [];
  };
  for (const node of tree.children) {
    if (node.type === 'separator') sections.push({ label: node.name, items: [] });
    else sections.at(-1)!.items.push(...pagesOf(node));
  }
  return sections.filter((section) => section.items.length > 0);
}

export default function Layout({ children }: LayoutProps<'/docs'>) {
  return (
    // The header is 3.5rem tall and sticky, so the docked sidebar sticks below it.
    <SidebarProvider className="flex-col [&_[data-slot=sidebar-inner]]:top-14 [&_[data-slot=sidebar-inner]]:h-[calc(100svh-3.5rem)]">
      <SkipLink />
      <SiteHeader fullWidth menu={<DocsMenuButton className="me-2 md:hidden" />} />
      <div className="flex flex-1">
        <DocsSidebar sections={sidebarSections(source.getPageTree())} />
        <SidebarInset id="content" tabIndex={-1} className="outline-none">
          {children}
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
