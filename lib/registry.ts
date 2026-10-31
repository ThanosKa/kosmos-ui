import { globSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { proDeploymentUrl, siteUrl } from './shared.ts';
import { kosmosTokensAsCssVars } from './tokens.ts';

/**
 * Registry items are authored one per file, next to their source, as
 * `registry/**\/<name>.registry.json` (shadcn registry-item schema, file paths
 * relative to the repo root). `pnpm registry:build` composes them into the
 * root `registry.json` and runs `shadcn build`; nothing else lists them.
 */
export const registryItemGlob = 'registry/**/*.registry.json';
export const registryNamespace = '@kosmos';
/**
 * The public registry URL users put in `components.json`, on the site's origin (`NEXT_PUBLIC_SITE_URL`):
 * docs, llms.txt and install commands all read it from here.
 */
export const registryUrl = `${siteUrl}/r/{name}.json`;
/** Arguments for `shadcn registry add`, which writes the `@kosmos` entry into `components.json`. */
export const registryAddArgs = `registry add ${registryNamespace}=${registryUrl}`;
/** The `registries` entry that `shadcn registry add` writes, for users who edit `components.json` by hand. */
export const registryConfig = JSON.stringify({ registries: { [registryNamespace]: registryUrl } }, null, 2);

export type RegistryFile = { path: string; type: string; target?: string };

export type RegistryItem = {
  name: string;
  type: string;
  title?: string;
  description?: string;
  dependencies?: string[];
  devDependencies?: string[];
  registryDependencies?: string[];
  files?: RegistryFile[];
  cssVars?: Record<string, Record<string, string>>;
  /** CSS rules the CLI writes into the project's stylesheet, as a preset with a style ships them. */
  css?: Record<string, unknown>;
  /** On a block, its one block category. */
  categories?: string[];
  meta?: Record<string, unknown>;
  [key: string]: unknown;
};

/**
 * Groups, in build order. Each component or block names its group in its own
 * `<name>.registry.json` as `"meta": { "group": "<key>" }`, so items built in parallel never edit a
 * shared list. The label shows in the docs sidebar, so it stays English.
 */
export const groups = {
  basics: 'Basics',
  forms: 'Forms',
  overlays: 'Overlays',
  navigation: 'Navigation',
  data: 'Data',
  charts: 'Charts',
  'chart-bar': 'Bar',
  'chart-line': 'Line & area',
  'chart-ring': 'Ring',
  'chart-other': 'Other',
  ai: 'AI',
  effects: 'Effects',
  misc: 'Misc',
  blocks: 'Blocks',
} as const;
export type Group = keyof typeof groups;
const groupedTypes = ['registry:ui', 'registry:block'];

export function isGroup(value: unknown): value is Group {
  return typeof value === 'string' && Object.hasOwn(groups, value);
}

/**
 * The groups the Charts tab lists, ready-made charts by kind; every other component group is in the Components tab,
 * `charts` too, which holds the parts you build a chart from.
 */
export function isChartGroup(group: Group): boolean {
  return group.startsWith('chart-');
}

/** The docs folder of a component's page: `charts` for a chart group, else `components`. */
export function componentDocsFolder(item: RegistryItem): 'components' | 'charts' {
  const group = item.meta?.group;
  return isGroup(group) && isChartGroup(group) ? 'charts' : 'components';
}

/** The items of one approval group, sorted by name. */
export function itemsInGroup(group: Group, items: RegistryItem[] = readRegistryItems()): RegistryItem[] {
  return items.filter((item) => item.meta?.group === group).sort((a, b) => a.name.localeCompare(b.name));
}

const typeOrder = ['registry:theme', 'registry:lib', 'registry:hook', 'registry:ui', 'registry:component', 'registry:block'];

function readItem(file: string, root: string): RegistryItem {
  const { $schema: _schema, ...item } = JSON.parse(readFileSync(join(/*turbopackIgnore: true*/ root, file), 'utf8')) as RegistryItem & {
    $schema?: string;
  };
  const expected = file.split('/').pop()!.replace('.registry.json', '');
  if (item.name !== expected) {
    throw new Error(`${file}: "name" is "${item.name}", expected "${expected}" (the file name)`);
  }
  const cssVarsFrom = item.meta?.cssVarsFrom;
  if (cssVarsFrom === 'registry/kosmos/styles/tokens.css') {
    const { cssVarsFrom: _from, ...meta } = item.meta!;
    return { ...item, cssVars: kosmosTokensAsCssVars(), meta: Object.keys(meta).length ? meta : undefined };
  }
  if (cssVarsFrom) throw new Error(`${file}: unsupported meta.cssVarsFrom "${String(cssVarsFrom)}"`);
  const group = item.meta?.group;
  if (groupedTypes.includes(item.type) ? !isGroup(group) : group !== undefined) {
    throw new Error(
      `${file}: ${groupedTypes.includes(item.type) ? `a ${item.type} item needs` : `a ${item.type} item takes no`} "meta": { "group": ${Object.keys(groups).map((key) => `"${key}"`).join(' | ')} }, got ${JSON.stringify(group)}`,
    );
  }
  checkBlockVariant(file, item);
  return item;
}

/**
 * Block sections, in sidebar order: what a visitor is building. Each block category sits in one, and the Blocks
 * sidebar shows a section only once it has a category. Public labels, so they stay English.
 */
export const blockSections = {
  application: 'Application',
  marketing: 'Marketing',
  ai: 'AI',
} as const;
export type BlockSection = keyof typeof blockSections;

/** Free variants are registry items in this repo; Pro variants never are (ADR 0003). */
export const blockTiers = { free: 'Free', pro: 'Pro' } as const;
export type BlockTier = keyof typeof blockTiers;

export const isBlockSection = (value: unknown): value is BlockSection => typeof value === 'string' && Object.hasOwn(blockSections, value);
const blockCategoryPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * A `registry:block` item is a free variant of one block category: `"categories": ["<category>"]` (shadcn's field)
 * and `"meta": { "group": "blocks", "section": "<section>", "tier": "free" }`. No other item takes these.
 */
function checkBlockVariant(file: string, item: RegistryItem) {
  const { categories } = item;
  const { section, tier } = item.meta ?? {};
  if (item.type !== 'registry:block') {
    if (categories !== undefined || section !== undefined || tier !== undefined) {
      throw new Error(`${file}: only a registry:block item takes "categories", "meta.section" and "meta.tier"`);
    }
    return;
  }
  if (!Array.isArray(categories) || categories.length !== 1 || !blockCategoryPattern.test(String(categories[0]))) {
    throw new Error(`${file}: a block needs "categories": ["<block category>"], one kebab-case name, got ${JSON.stringify(categories)}`);
  }
  if (!isBlockSection(section)) {
    throw new Error(`${file}: a block needs "meta.section": ${Object.keys(blockSections).map((key) => `"${key}"`).join(' | ')}, got ${JSON.stringify(section)}`);
  }
  if (tier !== 'free') {
    throw new Error(`${file}: a block in this repo is a free variant, "meta.tier": "free" (Pro code never enters it, ADR 0003), got ${JSON.stringify(tier)}`);
  }
}

/** One variant of a block category, Free or Pro: what the sidebar counts and a category page and the block viewer show. */
export type BlockVariant = {
  /** The registry item name a free variant installs as. */
  name: string;
  title: string;
  description?: string;
  category: string;
  section: BlockSection;
  tier: BlockTier;
  /**
   * The page that renders the variant alone, for the block viewer's iframe and "open in a new tab": a preview route
   * of this site for a free variant, a page of the Pro deployment for a Pro one.
   */
  previewUrl: string;
};

export type BlockCategory = { name: string; section: BlockSection; variants: BlockVariant[] };

/** The free variant a registry block item is. */
function freeVariant(item: RegistryItem): BlockVariant {
  return {
    name: item.name,
    title: item.title ?? item.name,
    description: item.description,
    category: item.categories![0],
    section: item.meta!.section as BlockSection,
    tier: 'free',
    previewUrl: `/view/${item.name}-demo`,
  };
}

/**
 * What the public repo knows of a Pro variant: no code, only its name, its block category and the page on the Pro
 * deployment that renders it. It takes the section of its category, which a free variant declares.
 */
export type ProVariant = Pick<BlockVariant, 'name' | 'title' | 'description' | 'category' | 'previewUrl'>;

/**
 * Every Pro variant, as metadata only: its code lives in the private Pro repo and never here (ADR 0003). `previewPath`
 * is the page of the Pro deployment that renders it alone; it takes `?theme=light|dark`, since a frame on another
 * origin cannot read the docs theme.
 */
export const proVariants: (Omit<ProVariant, 'previewUrl'> & { previewPath: string })[] = [
  {
    name: 'auth-split-screen',
    title: 'Auth split screen',
    description:
      'Log in and sign up on one side of the page and a panel that shows your product on the other, with labels, inline errors, loading and success states. Below 896px wide the form stands alone.',
    category: 'auth',
    previewPath: '/view/auth-split-screen-demo',
  },
];

/** The Pro variants the site shows, on the Pro deployment. None without `NEXT_PUBLIC_KOSMOS_PRO_URL`. */
export function readProVariants(deploymentUrl: string | undefined = proDeploymentUrl): ProVariant[] {
  if (!deploymentUrl) return [];
  return proVariants.map(({ previewPath, ...variant }) => ({ ...variant, previewUrl: `${deploymentUrl}${previewPath}` }));
}

/**
 * Every block category, A–Z by name, with its variants: free first, then by name. The one reader of block categories,
 * so the docs sidebar, the counts and the landing agree. Throws when variants of one category name different sections,
 * or when a Pro variant names a category no free variant declares.
 */
export function readBlockCategories(items: RegistryItem[] = readRegistryItems(), shownProVariants: ProVariant[] = readProVariants()): BlockCategory[] {
  const categories = new Map<string, BlockCategory>();
  for (const variant of items.filter((item) => item.type === 'registry:block').map(freeVariant)) {
    const category = categories.get(variant.category) ?? { name: variant.category, section: variant.section, variants: [] };
    if (category.section !== variant.section) {
      throw new Error(`Block category "${variant.category}": "${variant.name}" is in section "${variant.section}", the others in "${category.section}"`);
    }
    category.variants.push(variant);
    categories.set(variant.category, category);
  }
  for (const variant of shownProVariants) {
    const category = categories.get(variant.category);
    if (!category) throw new Error(`Pro variant "${variant.name}": block category "${variant.category}" has no free variant`);
    category.variants.push({ ...variant, section: category.section, tier: 'pro' });
  }
  const tierRank = (tier: BlockTier) => Object.keys(blockTiers).indexOf(tier);
  return [...categories.values()]
    .map((category) => ({
      ...category,
      variants: category.variants.sort((a, b) => tierRank(a.tier) - tierRank(b.tier) || a.name.localeCompare(b.name)),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function getBlockCategory(
  name: string,
  items: RegistryItem[] = readRegistryItems(),
  shownProVariants?: ProVariant[],
): BlockCategory | undefined {
  return readBlockCategories(items, shownProVariants).find((category) => category.name === name);
}

/** Every registry item, sorted by type then name, validated for unique names and existing files and deps. */
export function readRegistryItems(root = process.cwd()): RegistryItem[] {
  const files = globSync(registryItemGlob, { cwd: root }).sort();
  const items = files.map((file) => readItem(file, root));
  const names = new Set<string>();
  for (const item of items) {
    if (names.has(item.name)) throw new Error(`Duplicate registry item name "${item.name}"`);
    names.add(item.name);
  }
  for (const item of items) {
    for (const file of item.files ?? []) {
      try {
        readFileSync(join(/*turbopackIgnore: true*/ root, file.path));
      } catch {
        throw new Error(`${item.name}: file "${file.path}" does not exist`);
      }
    }
    for (const dep of item.registryDependencies ?? []) {
      const local = dep.startsWith(`${registryNamespace}/`) ? dep.slice(registryNamespace.length + 1) : null;
      if (local && !names.has(local)) throw new Error(`${item.name}: registry dependency "${dep}" has no item`);
    }
  }
  const rank = (type: string) => (typeOrder.includes(type) ? typeOrder.indexOf(type) : typeOrder.length);
  return items.sort((a, b) => rank(a.type) - rank(b.type) || a.name.localeCompare(b.name));
}

export function getRegistryItem(name: string, root = process.cwd()): RegistryItem | undefined {
  return readRegistryItems(root).find((item) => item.name === name);
}

/** The item first, then every `@kosmos/*` item it pulls in, in dependency order (deepest first). */
export function resolveRegistryTree(name: string, items: RegistryItem[] = readRegistryItems()): RegistryItem[] {
  const byName = new Map(items.map((item) => [item.name, item]));
  const deps: RegistryItem[] = [];
  const seen = new Set<string>();
  const visit = (current: string) => {
    if (seen.has(current)) return;
    seen.add(current);
    const item = byName.get(current);
    if (!item) throw new Error(`No registry item "${current}"`);
    for (const dep of item.registryDependencies ?? []) {
      if (dep.startsWith(`${registryNamespace}/`)) visit(dep.slice(registryNamespace.length + 1));
    }
    if (current !== name) deps.push(item);
  };
  visit(name);
  return [byName.get(name)!, ...deps];
}

/**
 * Other `@kosmos/*` items that `code` (an example) imports and `tree` doesn't pull in, such as the Button a Popover
 * example opens from. Someone copying the example adds them too.
 */
export function extraImportedItems(code: string, tree: RegistryItem[], items: RegistryItem[] = readRegistryItems()): RegistryItem[] {
  const imported = new Set([...code.matchAll(/from '@\/registry\/kosmos\/(?:ui|lib)\/([a-z0-9-]+)'/g)].map((match) => match[1]));
  const inTree = new Set(tree.map((item) => item.name));
  return items.filter((item) => imported.has(item.name) && !inTree.has(item.name));
}

/** The item an example belongs to, by its name: `button-with-icon` → `button`, `page-header-demo` → `page-header`. */
export function exampleOwner(example: string, items: RegistryItem[] = readRegistryItems()): RegistryItem | undefined {
  return items
    .filter((item) => example === item.name || example.startsWith(`${item.name}-`))
    .sort((a, b) => b.name.length - a.name.length)[0];
}

/**
 * The `@kosmos` items the example `example` (with source `code`) imports beyond what `page` installs: the item
 * of the docs page that shows it, or else the item the example is named after.
 */
export function exampleExtras(example: string, code: string, page?: string, items: RegistryItem[] = readRegistryItems()): RegistryItem[] {
  const owner = items.find((item) => item.name === page) ?? exampleOwner(example, items);
  return owner ? extraImportedItems(code, resolveRegistryTree(owner.name, items), items) : [];
}

/** A theme item's `cssVars` as the CSS the CLI writes, for manual installation. */
export function cssVarsAsCss(cssVars: NonNullable<RegistryItem['cssVars']>): string {
  const block = (selector: string, vars: Record<string, string> = {}) =>
    `${selector} {\n${Object.entries(vars)
      .map(([key, value]) => `  --${key}: ${value};`)
      .join('\n')}\n}`;
  return [block('@theme inline', cssVars.theme), block(':root', cssVars.light), block('.dark', cssVars.dark)].join('\n\n');
}

/**
 * Where each registry file type lives in this repo (under `registry/kosmos/`) and where `shadcn add`
 * writes it in a default project. `installedPath` and `toInstalledImports` both read this one map.
 * `source` is a regular expression: a block's files sit in a folder per block and all land in `components/`.
 */
const fileDirs: Record<string, { source: string; installed: string }> = {
  'registry:ui': { source: 'ui/', installed: 'components/ui/' },
  'registry:lib': { source: 'lib/', installed: 'lib/' },
  'registry:hook': { source: 'hooks/', installed: 'hooks/' },
  'registry:component': { source: 'blocks/[a-z0-9-]+/', installed: 'components/' },
};

/** Where `shadcn add` writes a registry file in a default project (`components/ui`, `lib`, `hooks`, `components`). */
export function installedPath(file: RegistryFile): string {
  if (file.target) return file.target.replace(/^~\//, '');
  const base = file.path.split('/').pop()!;
  return `${fileDirs[file.type]?.installed ?? 'components/'}${base}`;
}

/** Rewrites `@/registry/kosmos/...` imports the way `shadcn add` does, for code shown in the docs. */
export function toInstalledImports(code: string): string {
  return Object.values(fileDirs).reduce(
    (result, { source, installed }) => result.replace(new RegExp(`@/registry/kosmos/${source}`, 'g'), `@/${installed}`),
    code,
  );
}

export const packageRunners = {
  npm: 'npx shadcn@latest',
  pnpm: 'pnpm dlx shadcn@latest',
  yarn: 'yarn dlx shadcn@latest',
  bun: 'bunx --bun shadcn@latest',
} as const;

/** The command each package manager adds a package with, keyed like `packageRunners`. */
export const packageInstallers = {
  npm: 'npm install',
  pnpm: 'pnpm add',
  yarn: 'yarn add',
  bun: 'bun add',
} as const satisfies Record<keyof typeof packageRunners, string>;

/** The `shadcn add` lines for an item, in the documented order. */
export function installCommands(name: string, runner: string = packageRunners.npm): string {
  return [
    '# once per project: the @kosmos registry and the Kosmos tokens',
    `${runner} ${registryAddArgs}`,
    `${runner} add ${registryNamespace}/tokens`,
    '',
    `${runner} add ${registryNamespace}/${name}`,
  ].join('\n');
}
