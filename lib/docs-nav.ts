import { createElement, type ReactNode } from 'react';
import { flattenTree } from 'fumadocs-core/page-tree';
import {
  ChartColumn,
  Compass,
  Layers2,
  LayoutDashboard,
  Library,
  Puzzle,
  Shapes,
  TextCursorInput,
  type LucideIcon,
} from 'lucide-react';
import { changelogFolder, getChangelogEntries } from './changelog';
import { docsTabOf, type DocsTabId } from './docs-tabs';
import { groups, isGroup, readRegistryItems, type Group, type RegistryItem } from './registry';
import { docsRoute } from './shared';
import { source } from './source';

export type DocsNavSectionId = 'get-started' | 'foundations' | 'components' | 'blocks';

export type DocsNavItem = { title: string; url: string; icon?: ReactNode };

export type DocsNavSection = {
  id: DocsNavSectionId;
  /** The header tab whose sidebar shows this section. */
  tab: DocsTabId;
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

const sectionTabs: Record<DocsNavSectionId, DocsTabId> = {
  'get-started': 'docs',
  foundations: 'docs',
  components: 'components',
  blocks: 'blocks',
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
 * Every docs sidebar section, top to bottom, each with the header tab that shows it. Server only (reads the registry
 * from disk): pass the result to client components. Sections come from slug prefixes, so moving a page into `foundations/` moves it in the nav. Get started and
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
      items[section].push({ title: 'Overview', url: page.url, icon: createElement(Library) });
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
    tab: sectionTabs[id],
    label: sectionLabels[id],
    items: items[id],
    groups: id === 'components' || id === 'blocks' ? groupsOf(id) : [],
  }));
  return { sections: sections.filter((section) => section.items.length > 0 || section.groups.length > 0) };
}

/** The registry group of a page under `components/` or `blocks/`; throws so no page silently leaves the nav. */
function registryGroup(slugs: string[], registryItems: RegistryItem[]): Group {
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

/** Every item in the sidebar of `tab`, top to bottom: the order of previous and next. */
function flattenDocsNav(tab: DocsTabId | undefined): DocsNavItem[] {
  return getDocsNav()
    .sections.filter((section) => section.tab === tab)
    .flatMap((section) => [...section.items, ...section.groups.flatMap((group) => group.items)]);
}

export type DocsPageLink = { title: string; url: string };

export type DocsNeighbours = {
  previous?: DocsPageLink;
  next?: DocsPageLink;
  /** What previous and next mean here, when it isn't the sidebar order. */
  labels?: { previous: string; next: string };
};

function neighboursIn(links: DocsPageLink[], url: string, labels?: DocsNeighbours['labels']): DocsNeighbours | undefined {
  const index = links.findIndex((link) => link.url === url);
  if (index === -1) return undefined;
  return { previous: links[index - 1], next: links[index + 1], labels };
}

/**
 * The pages before and after `url` in the sidebar of its tab, so previous and next never switch tabs; for a changelog
 * entry, which sits outside the sidebar, the newer and older entries.
 */
export function neighboursOf(url: string): DocsNeighbours | undefined {
  const changelog = getChangelogEntries().map(({ page }) => ({ title: page.data.title, url: page.url }));
  return neighboursIn(flattenDocsNav(docsTabOf(url)), url) ?? neighboursIn(changelog, url, { previous: 'Newer', next: 'Older' });
}

/** The registry group of a component or block page; `undefined` for every other page. */
export function groupOfPage(page: { slugs: string[] }): Group | undefined {
  const section = sectionOf(page.slugs);
  if ((section !== 'components' && section !== 'blocks') || page.slugs.length === 1) return undefined;
  return registryGroup(page.slugs, readRegistryItems());
}

export type DocsIndexItem = DocsNavItem & { name: string; description?: string };

export type DocsIndexGroup = Omit<DocsNavGroup, 'items'> & { items: DocsIndexItem[] };

/** The groups of the components or blocks index in sidebar order, each item with its registry name and page description. */
export function getDocsIndex(section: 'components' | 'blocks'): DocsIndexGroup[] {
  const pages = new Map(source.getPages().map((page) => [page.url, page]));
  return (getDocsNav().sections.find((candidate) => candidate.id === section)?.groups ?? []).map((group) => ({
    ...group,
    items: group.items.map((item) => {
      const page = pages.get(item.url)!;
      return { ...item, name: page.slugs[1], description: page.data.description };
    }),
  }));
}

export type DocsEyebrowPart = { label: string; url?: string };

/**
 * Where a page sits in the sidebar, for the eyebrow over its title: the section, plus the registry group on a
 * component page. Sections and groups with an index page link to it; a changelog entry names the changelog.
 */
export function eyebrowOf(page: { slugs: string[] }): DocsEyebrowPart[] {
  if (page.slugs[0] === changelogFolder && page.slugs.length === 2) return [{ label: 'Changelog', url: `${docsRoute}/${changelogFolder}` }];
  const section = sectionOf(page.slugs);
  if (section !== 'components' && section !== 'blocks') return [{ label: sectionLabels[section] }];
  const sectionPart = { label: sectionLabels[section], url: `${docsRoute}/${section}` };
  const group = groupOfPage(page);
  if (!group || group === 'blocks') return [sectionPart];
  return [sectionPart, { label: groups[group], url: `${docsRoute}/components#group-${group}` }];
}
