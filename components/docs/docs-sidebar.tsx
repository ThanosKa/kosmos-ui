'use client';

import { Collapsible } from '@base-ui/react/collapsible';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState, type MouseEvent } from 'react';
import { SiteNav } from '@/components/site/site-nav';
import type { DocsNav, DocsNavGroup, DocsNavItem, DocsNavSectionId } from '@/lib/docs-nav';
import { docsTabOf } from '@/lib/docs-tabs';
import { cn } from '@/registry/kosmos/lib/cn';
import { Badge } from '@/registry/kosmos/ui/badge';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/registry/kosmos/ui/sidebar';

const scrollKey = 'kosmos:docs-sidebar-scroll';

/** Opens a docs page without reloading the shell, so the sidebar keeps its scroll position. Modified clicks keep the browser's behavior. */
function useClientNavigation() {
  const router = useRouter();
  return (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    router.push(event.currentTarget.getAttribute('href')!);
  };
}

/** Centers `element` in `container` when it is out of view, leaving the window where it is. */
function revealInside(container: HTMLElement, element: Element | null) {
  if (!element) return;
  const box = container.getBoundingClientRect();
  const item = element.getBoundingClientRect();
  if (item.top >= box.top && item.bottom <= box.bottom) return;
  container.scrollTop += (item.top + item.bottom) / 2 - (box.top + box.bottom) / 2;
}

/**
 * Keeps the sidebar's scroll position across reloads and brings the current item into view. Client navigations keep the
 * position on their own, because the docs layout stays mounted. A ref callback, so it also runs when the phone drawer opens.
 */
function useSidebarScroll(pathname: string) {
  const navRef = useRef<HTMLElement | null>(null);
  const ref = useCallback((nav: HTMLElement | null) => {
    navRef.current = nav;
    if (!nav) return;
    try {
      nav.scrollTop = Number(sessionStorage.getItem(scrollKey)) || 0;
    } catch {}
    revealInside(nav, nav.querySelector('[aria-current="page"]'));
    const save = () => {
      try {
        sessionStorage.setItem(scrollKey, String(nav.scrollTop));
      } catch {}
    };
    nav.addEventListener('scroll', save, { passive: true });
    return () => nav.removeEventListener('scroll', save);
  }, []);

  useEffect(() => {
    const nav = navRef.current;
    if (nav) revealInside(nav, nav.querySelector('[aria-current="page"]'));
  }, [pathname]);

  return ref;
}

/** The group holding `pathname` opens on load and whenever a navigation enters it; the visitor opens and closes the rest. */
function useOpenGroups(nav: DocsNav, pathname: string) {
  const currentGroup = nav.sections
    .flatMap((section) => section.groups)
    .find((group) => group.items.some((item) => item.url === pathname))?.id;
  const [open, setOpen] = useState(() => new Set<string>(currentGroup ? [currentGroup] : []));
  const [openedFor, setOpenedFor] = useState(currentGroup);
  if (currentGroup !== openedFor) {
    setOpenedFor(currentGroup);
    if (currentGroup && !open.has(currentGroup)) setOpen(new Set(open).add(currentGroup));
  }
  const toggle = (id: string, isOpen: boolean) =>
    setOpen((current) => {
      const next = new Set(current);
      if (isOpen) next.add(id);
      else next.delete(id);
      return next;
    });
  return { isOpen: (id: string) => open.has(id), toggle };
}

const countNoun: Partial<Record<DocsNavSectionId, [string, string]>> = {
  components: ['component', 'components'],
};

/**
 * The docs navigation of the current header tab: a docked Kosmos Sidebar from `md` up and a drawer below, opened from the
 * header, with the header tabs on top. The Docs tab lists Get started and Foundations; Components lists an Overview, then
 * one group per registry group that opens and closes; Blocks lists an Overview, then its block sections, each block
 * category with its variant count when it has more than one, or a New badge while its "Added" changelog entry is recent.
 */
export function DocsSidebar({ nav }: { nav: DocsNav }) {
  const pathname = usePathname();
  const tab = docsTabOf(pathname);
  const sections = nav.sections.filter((section) => section.tab === tab);
  const { isMobile } = useSidebar();
  const scrollRef = useSidebarScroll(pathname);
  const { isOpen, toggle } = useOpenGroups(nav, pathname);

  return (
    <Sidebar label="Docs">
      {isMobile && (
        <SidebarHeader>
          <SiteNav />
        </SidebarHeader>
      )}
      <SidebarContent render={<nav aria-label="Docs" ref={scrollRef} />}>
        {sections.map((section) => (
          <SidebarGroup key={section.id}>
            <SidebarGroupLabel render={<h2 />}>{section.label}</SidebarGroupLabel>
            <SidebarMenu>
              {section.items.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <DocsSidebarLink item={item} pathname={pathname} />
                </SidebarMenuItem>
              ))}
              {section.groups.map((group) => (
                <DocsSidebarGroup
                  key={group.id}
                  group={group}
                  noun={countNoun[section.id]!}
                  pathname={pathname}
                  open={isOpen(group.id)}
                  onOpenChange={(open) => toggle(group.id, open)}
                />
              ))}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}

function DocsSidebarLink({ item, pathname, className }: { item: DocsNavItem; pathname: string; className?: string }) {
  const router = useRouter();
  const navigate = useClientNavigation();
  return (
    <SidebarMenuButton
      href={item.url}
      isActive={item.url === pathname}
      onClick={navigate}
      onPointerEnter={() => router.prefetch(item.url)}
      onFocus={() => router.prefetch(item.url)}
      className={className}
    >
      {item.icon}
      <span>{item.title}</span>
      {item.isNew ? (
        <Badge variant="blue" className="ms-auto">
          New
        </Badge>
      ) : (
        item.variants !== undefined &&
        item.variants > 1 && (
          <>
            <span className="sr-only">{item.variants} variants</span>
            <SidebarMenuBadge aria-hidden>{item.variants}</SidebarMenuBadge>
          </>
        )
      )}
    </SidebarMenuButton>
  );
}

type DocsSidebarGroupProps = {
  group: DocsNavGroup;
  noun: [string, string];
  pathname: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

/**
 * One registry group: a toggle with the group's icon, name and, while closed, its item count, over its pages A–Z. The count
 * fades out as the group opens and keeps its place, so the chevron stays put; screen readers always hear it.
 */
function DocsSidebarGroup({ group, noun, pathname, open, onOpenChange }: DocsSidebarGroupProps) {
  const count = group.items.length;
  return (
    <Collapsible.Root open={open} onOpenChange={onOpenChange} render={<SidebarMenuItem />}>
      <Collapsible.Trigger render={<SidebarMenuButton className="group/group-trigger" />}>
        {group.icon}
        <span>{group.label}</span>
        <span className="sr-only">
          {count} {noun[count === 1 ? 0 : 1]}
        </span>
        <SidebarMenuBadge aria-hidden className="transition-[opacity] duration-fast group-data-panel-open/group-trigger:opacity-0">
          {count}
        </SidebarMenuBadge>
        {/* Turns as the group opens; under reduced motion the right and down chevrons cross-fade instead. */}
        <span
          aria-hidden
          className="relative -me-0.5 size-3.5 shrink-0 *:absolute *:inset-0"
        >
          <ChevronRight
            className={cn(
              'transition-[rotate,opacity] duration-fast ease-power3-out group-data-panel-open/group-trigger:duration-slow',
              'motion-safe:group-data-panel-open/group-trigger:rotate-90 motion-safe:group-data-panel-open/group-trigger:ease-smooth-in-out',
              'motion-reduce:group-data-panel-open/group-trigger:opacity-0',
            )}
          />
          <ChevronDown className="opacity-0 transition-[opacity] duration-fast motion-reduce:group-data-panel-open/group-trigger:opacity-100" />
        </span>
      </Collapsible.Trigger>
      <Collapsible.Panel
        hiddenUntilFound
        className={cn(
          'h-(--collapsible-panel-height) overflow-hidden duration-fast ease-power3-out data-open:duration-slow',
          'motion-safe:transition-[height] motion-safe:data-open:ease-smooth-in-out motion-safe:data-ending-style:h-0 motion-safe:data-starting-style:h-0',
          'motion-reduce:transition-[opacity] motion-reduce:data-ending-style:opacity-0 motion-reduce:data-starting-style:opacity-0',
        )}
      >
        <SidebarMenu className="ps-5.5 pt-0.5">
          {group.items.map((item) => (
            <SidebarMenuItem key={item.url}>
              {/* The panel clips anything outside it while it opens and closes, so the focus outline is drawn inside. */}
              <DocsSidebarLink item={item} pathname={pathname} className="focus-visible:-outline-offset-2" />
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </Collapsible.Panel>
    </Collapsible.Root>
  );
}
