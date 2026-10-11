'use client';

import { usePathname, useRouter } from 'next/navigation';
import type { MouseEvent, ReactNode } from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/registry/kosmos/ui/sidebar';

export type DocsSidebarItem = { name: ReactNode; url: string };
export type DocsSidebarSection = { label?: ReactNode; items: DocsSidebarItem[] };

/** Opens a docs page without reloading the shell, so the sidebar keeps its scroll position. Modified clicks keep the browser's behavior. */
function useClientNavigation() {
  const router = useRouter();
  return (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    router.push(event.currentTarget.getAttribute('href')!);
  };
}

/** The docs navigation: a docked Kosmos Sidebar from `md` up and a drawer below, opened from the header. */
export function DocsSidebar({ sections }: { sections: DocsSidebarSection[] }) {
  const pathname = usePathname();
  const router = useRouter();
  const navigate = useClientNavigation();

  return (
    <Sidebar label="Docs">
      <SidebarContent render={<nav aria-label="Docs" />}>
        {sections.map((section, index) => (
          <SidebarGroup key={index}>
            {section.label && <SidebarGroupLabel render={<h2 />}>{section.label}</SidebarGroupLabel>}
            <SidebarMenu>
              {section.items.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton
                    href={item.url}
                    isActive={item.url === pathname}
                    onClick={navigate}
                    onPointerEnter={() => router.prefetch(item.url)}
                    onFocus={() => router.prefetch(item.url)}
                  >
                    <span>{item.name}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}
