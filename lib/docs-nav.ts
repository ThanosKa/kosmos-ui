import { createElement, type ReactNode } from 'react';
import { flattenTree } from 'fumadocs-core/page-tree';
import { ChartColumn, Compass, Layers2, LayoutDashboard, Puzzle, Shapes, TextCursorInput, type LucideIcon } from 'lucide-react';
import { groups, isGroup, readRegistryItems, type Group } from './registry';
import { source } from './source';

export type DocsNavSectionId = 'get-started' | 'foundations' | 'components' | 'blocks';

export type DocsNavItem = { title: string; url: string; icon?: ReactNode };

export type DocsNavSection = {
  id: DocsNavSectionId;
  label: string;
  items: DocsNavItem[];
  groups: DocsNavGroup[];
};

export type DocsNavGroup = { id: Group; label: string; icon: ReactNode; items: DocsNavItem[] };

export type DocsNav = { sections: DocsNavSection[] };

const sectionLabels: Record<DocsNavSectionId, string> = {
  'get-started': 'Get started',
  foundations: 'Foundations',
  components: 'Components',
  blocks: 'Blocks',
};

const groupIcons: Record<Group, LucideIcon> = {
  basics: Shapes,
  forms: TextCursorInput,
  overlays: Layers2,
  navigation: Compass,
  data: ChartColumn,
  misc: Puzzle,
  blocks: LayoutDashboard,
};

function sectionOf(slugs: string[]): DocsNavSectionId {
  const [folder] = slugs;
  return folder === 'foundations' || folder === 'components' || folder === 'blocks' ? folder : 'get-started';
}

/**
 * The docs sidebar, top to bottom. Server only (reads the registry from disk): pass the result to client components.
 * Sections come from slug prefixes, so moving a page into `foundations/` moves it in the nav. Get started and
 * Foundations keep the page tree order of `meta.json`; Components and Blocks start with an Overview item, then
 * one group per registry `meta.group` in `groups` order, each A–Z by title.
 */
export function getDocsNav(): DocsNav {
  const items: Record<DocsNavSectionId, DocsNavItem[]> = { 'get-started': [], foundations: [], components: [], blocks: [] };
  for (const node of flattenTree(source.getPageTree().children)) {
    const page = source.getNodePage(node);
    if (!page) continue;
    const section = sectionOf(page.slugs);
    if (section === 'get-started' || section === 'foundations') {
      items[section].push({ title: page.data.title, url: page.url, icon: node.icon });
    }
  }

  const grouped = new Map<Group, DocsNavItem[]>();
  const registryItems = readRegistryItems();
  for (const page of source.getPages()) {
    const section = sectionOf(page.slugs);
    if (section !== 'components' && section !== 'blocks') continue;
    if (page.slugs.length === 1) {
      items[section].push({ title: 'Overview', url: page.url });
      continue;
    }
    const group = registryGroup(page.slugs, registryItems);
    grouped.set(group, [...(grouped.get(group) ?? []), { title: page.data.title, url: page.url }]);
  }

  const groupsOf = (section: DocsNavSectionId): DocsNavGroup[] =>
    (Object.keys(groups) as Group[])
      .filter((id) => grouped.has(id) && (id === 'blocks') === (section === 'blocks'))
      .map((id) => ({
        id,
        label: groups[id],
        icon: createElement(groupIcons[id]),
        items: grouped.get(id)!.sort((a, b) => a.title.localeCompare(b.title, 'en')),
      }));

  const sections = (Object.keys(sectionLabels) as DocsNavSectionId[]).map((id) => ({
    id,
    label: sectionLabels[id],
    items: items[id],
    groups: id === 'components' || id === 'blocks' ? groupsOf(id) : [],
  }));
  return { sections: sections.filter((section) => section.items.length > 0 || section.groups.length > 0) };
}

/** The registry group of a page under `components/` or `blocks/`; throws so no page silently leaves the nav. */
function registryGroup(slugs: string[], registryItems = readRegistryItems()): Group {
  const [folder, name, ...rest] = slugs;
  const item = registryItems.find((candidate) => candidate.name === name);
  const group = item?.meta?.group;
  if (rest.length > 0 || !isGroup(group) || (group === 'blocks') !== (folder === 'blocks')) {
    throw new Error(
      `content/docs/${slugs.join('/')}.mdx: expected a registry ${folder === 'blocks' ? 'block' : 'component'} named "${name}" ` +
        `with ${folder === 'blocks' ? '"blocks"' : 'a component group'} in meta.group, got ${item ? JSON.stringify(group) : 'no registry item'}`,
    );
  }
  return group;
}

/** Every nav item in sidebar order, top to bottom: the order of previous and next. */
export function flattenDocsNav(nav: DocsNav = getDocsNav()): DocsNavItem[] {
  return nav.sections.flatMap((section) => [...section.items, ...section.groups.flatMap((group) => group.items)]);
}

/** The registry group of a component or block page; `undefined` for every other page. */
export function groupOfPage(page: { slugs: string[] }): Group | undefined {
  const section = sectionOf(page.slugs);
  if ((section !== 'components' && section !== 'blocks') || page.slugs.length === 1) return undefined;
  return registryGroup(page.slugs);
}
