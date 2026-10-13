import { createElement, type ReactNode } from 'react';
import { flattenTree } from 'fumadocs-core/page-tree';
import {
  Bot,
  ChartColumn,
  Compass,
  Layers2,
  LayoutDashboard,
  Library,
  Megaphone,
  Puzzle,
  Shapes,
  Sparkles,
  TextCursorInput,
  type LucideIcon,
} from 'lucide-react';
import { changelogFolder, getChangelogEntries, getNewItemUrls } from './changelog';
import { docsTabOf, type DocsTabId } from './docs-tabs';
import {
  blockSections,
  groups,
  isBlockSection,
  isGroup,
  readBlockCategories,
  readRegistryItems,
  type BlockCategory,
  type BlockSection,
  type Group,
  type RegistryItem,
} from './registry';
import { docsRoute } from './shared';
import { source } from './source';

export type DocsNavSectionId = 'get-started' | 'foundations' | 'components' | 'blocks' | BlockSection;

export type DocsNavItem = {
  title: string;
  url: string;
  icon?: ReactNode;
  /** On a block category, how many variants it has. */
  variants?: number;
  /** Added recently (see `newItemUrls`): the sidebar shows a New badge instead of the count. */
  isNew?: boolean;
};

export type DocsNavSection = {
  id: DocsNavSectionId;
  /** The header tab whose sidebar shows this section. */
  tab: DocsTabId;
  label: string;
  items: DocsNavItem[];
  groups: DocsNavGroup[];
};

/** The registry groups of components; the `blocks` group is for approval only, the Blocks sidebar lists block categories. */
type ComponentGroup = Exclude<Group, 'blocks'>;

export type DocsNavGroup = { id: ComponentGroup; label: string; icon: ReactNode; items: DocsNavItem[] };

export type DocsNav = { sections: DocsNavSection[] };

const sectionLabels: Record<DocsNavSectionId, string> = {
  'get-started': 'Get started',
  foundations: 'Foundations',
  components: 'Components',
  blocks: 'Blocks',
  ...blockSections,
};

const sectionTabs: Record<DocsNavSectionId, DocsTabId> = {
  'get-started': 'docs',
  foundations: 'docs',
  components: 'components',
  blocks: 'blocks',
  application: 'blocks',
  marketing: 'blocks',
  ai: 'blocks',
};

const groupIcons: Record<ComponentGroup, LucideIcon> = {
  basics: Shapes,
  forms: TextCursorInput,
  overlays: Layers2,
  navigation: Compass,
  data: ChartColumn,
  misc: Puzzle,
  ai: Bot,
};

const blockSectionIcons: Record<BlockSection, LucideIcon> = {
  application: LayoutDashboard,
  marketing: Megaphone,
  ai: Sparkles,
};

/** The element id of a heading on the components or blocks index: a component group or a block section. */
const indexAnchor = (id: ComponentGroup | BlockSection) => (isBlockSection(id) ? `section-${id}` : `group-${id}`);

function sectionOf(slugs: string[]): DocsNavSectionId {
  const [folder] = slugs;
  return folder === 'foundations' || folder === 'components' || folder === 'blocks' ? folder : 'get-started';
}

/**
 * Every docs sidebar section, top to bottom, each with the header tab that shows it. Server only (reads the registry
 * from disk): pass the result to client components. Sections come from slug prefixes, so moving a page into `foundations/` moves it in the nav. Get started and
 * Foundations keep the page tree order of `meta.json`; Components and Blocks start with an Overview item. Components
 * follow with one group per registry `meta.group` in `groups` order, each A–Z by title. Blocks follow with one section
 * per block section that has a category, in `blockSections` order, each category A–Z by title with its variant count.
 */
export function getDocsNav(): DocsNav {
  const items: Record<DocsNavSectionId, DocsNavItem[]> = {
    'get-started': [],
    foundations: [],
    components: [],
    blocks: [],
    application: [],
    marketing: [],
    ai: [],
  };
  for (const node of flattenTree(source.getPageTree().children)) {
    const page = source.getNodePage(node);
    if (!page) continue;
    const section = sectionOf(page.slugs);
    if (section === 'get-started' || section === 'foundations') {
      items[section].push({ title: page.data.title, url: page.url, icon: node.icon });
    }
  }

  const grouped = new Map<ComponentGroup, DocsNavItem[]>();
  const registryItems = readRegistryItems();
  const categories = readBlockCategories(registryItems);
  const documented = new Set<string>();
  const newUrls = getNewItemUrls();
  for (const page of source.getPages()) {
    const section = sectionOf(page.slugs);
    if (section !== 'components' && section !== 'blocks') continue;
    if (page.slugs.length === 1) {
      items[section].push({ title: 'Overview', url: page.url, icon: createElement(Library) });
    } else if (section === 'blocks') {
      const category = blockCategoryOf(page.slugs, categories);
      documented.add(category.name);
      items[category.section].push({ title: page.data.title, url: page.url, variants: category.variants.length, isNew: newUrls.has(page.url) });
    } else {
      const group = registryGroup(page.slugs, registryItems);
      grouped.set(group, [...(grouped.get(group) ?? []), { title: page.data.title, url: page.url, isNew: newUrls.has(page.url) }]);
    }
  }
  const undocumented = categories.filter((category) => !documented.has(category.name));
  if (undocumented.length > 0) {
    throw new Error(`Block categories without a page: ${undocumented.map((category) => `content/docs/blocks/${category.name}.mdx`).join(', ')}`);
  }
  for (const id of Object.keys(blockSections) as BlockSection[]) items[id].sort((a, b) => a.title.localeCompare(b.title, 'en'));

  const groupsOf = (section: DocsNavSectionId): DocsNavGroup[] =>
    (Object.keys(groups) as Group[])
      .filter((id): id is ComponentGroup => section === 'components' && id !== 'blocks' && grouped.has(id))
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
    groups: groupsOf(id),
  }));
  return { sections: sections.filter((section) => section.items.length > 0 || section.groups.length > 0) };
}

/** The registry group of a page under `components/`; throws so no page silently leaves the nav. */
function registryGroup(slugs: string[], registryItems: RegistryItem[]): ComponentGroup {
  const [, name, ...rest] = slugs;
  const item = registryItems.find((candidate) => candidate.name === name);
  const group = item?.meta?.group;
  if (rest.length > 0 || !isGroup(group) || group === 'blocks') {
    throw new Error(
      `content/docs/${slugs.join('/')}.mdx: expected a registry component named "${name}" with a component group in meta.group, ` +
        `got ${item ? JSON.stringify(group) : 'no registry item'}`,
    );
  }
  return group;
}

/** The block category a page under `blocks/` documents, named by its file; throws so no page silently leaves the nav. */
function blockCategoryOf(slugs: string[], categories: BlockCategory[]): BlockCategory {
  const [, name, ...rest] = slugs;
  const category = categories.find((candidate) => candidate.name === name);
  if (rest.length > 0 || !category) {
    throw new Error(
      `content/docs/${slugs.join('/')}.mdx: expected a block category named "${name}", declared by a registry block as "categories": ["${name}"]`,
    );
  }
  return category;
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

/** The registry group of a component page; `undefined` for every other page. */
export function groupOfPage(page: { slugs: string[] }): ComponentGroup | undefined {
  if (sectionOf(page.slugs) !== 'components' || page.slugs.length === 1) return undefined;
  return registryGroup(page.slugs, readRegistryItems());
}

/** The block category of a block category page, with its variants; `undefined` for every other page. */
export function blockCategoryOfPage(page: { slugs: string[] }): BlockCategory | undefined {
  if (sectionOf(page.slugs) !== 'blocks' || page.slugs.length === 1) return undefined;
  return blockCategoryOf(page.slugs, readBlockCategories());
}

/** `name` is the registry item whose thumbnail the card shows: the component, or the first variant of a block category. */
export type DocsIndexItem = DocsNavItem & { name: string; description?: string };

/** A heading of an index page: a registry group of components, or a block section. `anchor` is its element id. */
export type DocsIndexGroup = { id: string; anchor: string; label: string; icon: ReactNode; items: DocsIndexItem[] };

/** The headings of the components or blocks index in sidebar order, each item with its thumbnail name and page description. */
export function getDocsIndex(folder: 'components' | 'blocks'): DocsIndexGroup[] {
  const pages = new Map(source.getPages().map((page) => [page.url, page]));
  const categories = new Map(readBlockCategories().map((category) => [category.name, category]));
  const indexItem = (item: DocsNavItem): DocsIndexItem => {
    const page = pages.get(item.url)!;
    const name = folder === 'blocks' ? categories.get(page.slugs[1])!.variants[0].name : page.slugs[1];
    return { ...item, name, description: page.data.description };
  };
  const { sections } = getDocsNav();
  if (folder === 'components') {
    return (sections.find((section) => section.id === 'components')?.groups ?? []).map((group) => ({
      ...group,
      anchor: indexAnchor(group.id),
      items: group.items.map(indexItem),
    }));
  }
  return sections.flatMap((section) =>
    isBlockSection(section.id)
      ? [
          {
            id: section.id,
            anchor: indexAnchor(section.id),
            label: section.label,
            icon: createElement(blockSectionIcons[section.id]),
            items: section.items.map(indexItem),
          },
        ]
      : [],
  );
}

export type DocsEyebrowPart = { label: string; url?: string };

/**
 * Where a page sits in the sidebar, for the eyebrow over its title: the section, plus the registry group on a
 * component page or the block section on a block category page. Each part links to its place on an index page; a
 * changelog entry names the changelog.
 */
export function eyebrowOf(page: { slugs: string[] }): DocsEyebrowPart[] {
  if (page.slugs[0] === changelogFolder && page.slugs.length === 2) return [{ label: 'Changelog', url: `${docsRoute}/${changelogFolder}` }];
  const section = sectionOf(page.slugs);
  if (section !== 'components' && section !== 'blocks') return [{ label: sectionLabels[section] }];
  const sectionPart = { label: sectionLabels[section], url: `${docsRoute}/${section}` };
  const category = blockCategoryOfPage(page);
  if (category) return [sectionPart, { label: blockSections[category.section], url: `${docsRoute}/blocks#${indexAnchor(category.section)}` }];
  const group = groupOfPage(page);
  if (!group) return [sectionPart];
  return [sectionPart, { label: groups[group], url: `${docsRoute}/components#${indexAnchor(group)}` }];
}
