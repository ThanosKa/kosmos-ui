import { globSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { kosmosTokensAsCssVars } from './tokens.ts';

/**
 * Registry items are authored one per file, next to their source, as
 * `registry/**\/<name>.registry.json` (shadcn registry-item schema, file paths
 * relative to the repo root). `pnpm registry:build` composes them into the
 * root `registry.json` and runs `shadcn build`; nothing else lists them.
 */
export const registryItemGlob = 'registry/**/*.registry.json';
export const registryNamespace = '@kosmos';
/** The public registry URL users put in `components.json` (domain pending purchase). */
export const registryUrl = 'https://kosmosui.com/r/{name}.json';

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
  meta?: Record<string, unknown>;
  [key: string]: unknown;
};

/**
 * Approval groups, in build order. Each component or block names its group in its own
 * `<name>.registry.json` as `"meta": { "group": "<key>" }`, so items built in parallel never edit a
 * shared list. `/approve/<key>` shows every item of a group; the label is public, so it stays English.
 */
export const groups = {
  basics: 'Basics',
  forms: 'Forms',
  overlays: 'Overlays',
  navigation: 'Navigation',
  data: 'Data',
  misc: 'Misc',
  blocks: 'Blocks',
} as const;
export type Group = keyof typeof groups;
const groupedTypes = ['registry:ui', 'registry:block'];

export function isGroup(value: unknown): value is Group {
  return typeof value === 'string' && Object.hasOwn(groups, value);
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
  return item;
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

/** A theme item's `cssVars` as the CSS the CLI writes, for manual installation. */
export function cssVarsAsCss(cssVars: NonNullable<RegistryItem['cssVars']>): string {
  const block = (selector: string, vars: Record<string, string> = {}) =>
    `${selector} {\n${Object.entries(vars)
      .map(([key, value]) => `  --${key}: ${value};`)
      .join('\n')}\n}`;
  return [block('@theme inline', cssVars.theme), block(':root', cssVars.light), block('.dark', cssVars.dark)].join('\n\n');
}

/** Where `shadcn add` writes a registry file in a default project (`components/ui`, `lib`, `hooks`, `components`). */
export function installedPath(file: RegistryFile): string {
  if (file.target) return file.target.replace(/^~\//, '');
  const base = file.path.split('/').pop()!;
  switch (file.type) {
    case 'registry:ui':
      return `components/ui/${base}`;
    case 'registry:lib':
      return `lib/${base}`;
    case 'registry:hook':
      return `hooks/${base}`;
    default:
      return `components/${base}`;
  }
}

/** Rewrites `@/registry/kosmos/...` imports the way `shadcn add` does, for code shown in the docs. */
export function toInstalledImports(code: string): string {
  return code
    .replace(/@\/registry\/kosmos\/ui\//g, '@/components/ui/')
    .replace(/@\/registry\/kosmos\/lib\//g, '@/lib/')
    .replace(/@\/registry\/kosmos\/hooks\//g, '@/hooks/');
}

export const packageRunners = {
  npm: 'npx shadcn@latest',
  pnpm: 'pnpm dlx shadcn@latest',
  yarn: 'yarn dlx shadcn@latest',
  bun: 'bunx --bun shadcn@latest',
} as const;

/** The `shadcn add` lines for an item, in the documented order. */
export function installCommands(name: string, runner: string = packageRunners.npm): string {
  return [
    '# once per project: the @kosmos registry and the Kosmos tokens',
    `${runner} registry add ${registryNamespace}=${registryUrl}`,
    `${runner} add ${registryNamespace}/tokens`,
    '',
    `${runner} add ${registryNamespace}/${name}`,
  ].join('\n');
}
