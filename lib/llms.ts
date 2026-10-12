import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { renderPlaceholder, type PlaceholderData } from 'fumadocs-core/mdx-plugins/remark-llms.runtime';
import { readExampleSource } from './examples';
import { getChangelogEntries } from './changelog';
import { getDocsIndex, getDocsNav, type DocsIndexItem } from './docs-nav';
import { colorTokens, modeLabels, motionTokens, radiusScale, shadowTokens, typeRoles, type ColorGroup } from './foundations';
import {
  cssVarsAsCss,
  getRegistryItem,
  installCommands,
  installedPath,
  packageInstallers,
  packageRunners,
  registryAddArgs,
  registryConfig,
  registryUrl,
  resolveRegistryTree,
  toInstalledImports,
} from './registry';
import { appName } from './shared';
import { source } from './source';

/** The production site, read from the registry URL, so links in the Markdown work wherever it is pasted. */
export const siteOrigin = new URL(registryUrl.replace('{name}', 'index')).origin;

const absolute = (path: string) => `${siteOrigin}${path}`;

const fence = (lang: string, code: string, title?: string) =>
  `\`\`\`${lang}${title ? ` title="${title}"` : ''}\n${code.trimEnd()}\n\`\`\``;

const code = (value: string) => `\`${value}\``;

function markdownTable(head: string[], rows: string[][]) {
  return [head, head.map(() => '---'), ...rows].map((cells) => `| ${cells.join(' | ')} |`).join('\n');
}

const nameOf = ({ attributes }: PlaceholderData) => String(attributes.name ?? '');

type EstreeNode = { type: string; [key: string]: unknown };

/** The value of a literal JS expression in an MDX attribute (`type={{ … }}`), read from its estree without running it. */
function literalValue(node: EstreeNode): unknown {
  if (node.type === 'Literal') return node.value;
  if (node.type === 'TemplateLiteral') {
    return (node.quasis as { value: { cooked: string } }[]).map((quasi) => quasi.value.cooked).join('');
  }
  if (node.type === 'ObjectExpression') {
    return Object.fromEntries(
      (node.properties as { key: EstreeNode; value: EstreeNode }[]).map((property) => [
        property.key.type === 'Identifier' ? property.key.name : property.key.value,
        literalValue(property.value),
      ]),
    );
  }
  throw new Error(`Unsupported expression in a docs attribute: ${node.type}`);
}

function expressionAttribute(data: PlaceholderData, name: string): unknown {
  const attribute = data.attributes[name] as { data?: { estree?: { body: { expression: EstreeNode }[] } } } | undefined;
  const expression = attribute?.data?.estree?.body[0]?.expression;
  if (!expression) throw new Error(`Expected a {…} expression in the "${name}" attribute of <${data.name}>`);
  return literalValue(expression);
}

type ApiProp = { description?: string; type: string; default?: string; required?: boolean };

/** Text for a Markdown table cell: pipes escaped, on one line. */
const cell = (value: string) => value.replaceAll('|', '\\|').replaceAll('\n', ' ');

function sourceFiles(name: string) {
  const [item] = resolveRegistryTree(name);
  return (item.files ?? [])
    .map((file) =>
      fence('tsx', toInstalledImports(readFileSync(join(/*turbopackIgnore: true*/ process.cwd(), file.path), 'utf8')), installedPath(file)),
    )
    .join('\n\n');
}

/** Markdown for the docs MDX components, so llms.txt carries code instead of JSX tags. */
const placeholders = {
  TypeTable: (data: PlaceholderData) =>
    markdownTable(
      ['Prop', 'Type', 'Default', 'Description'],
      Object.entries(expressionAttribute(data, 'type') as Record<string, ApiProp>).map(([name, prop]) => [
        `${code(name)}${prop.required ? ' (required)' : ''}`,
        code(cell(prop.type)),
        prop.default ? code(cell(prop.default)) : '',
        cell(prop.description ?? ''),
      ]),
    ),
  ComponentPreview: (data: PlaceholderData) => fence('tsx', toInstalledImports(readExampleSource(nameOf(data)))),
  ComponentInstall: (data: PlaceholderData) => fence('bash', installCommands(nameOf(data))),
  ComponentSource: (data: PlaceholderData) => sourceFiles(nameOf(data)),
  ShadcnCommand: ({ attributes }: PlaceholderData) =>
    fence('bash', `${packageRunners.npm} ${'registryAdd' in attributes ? registryAddArgs : String(attributes.args)}`),
  RegistryConfig: () => fence('json', registryConfig, 'components.json'),
  RegistryCss: (data: PlaceholderData) => fence('css', cssVarsAsCss(getRegistryItem(nameOf(data))?.cssVars ?? {}), 'app/globals.css'),
  // A list, not the full entries: each entry is its own page, so llms-full.txt carries its text once.
  ChangelogEntries: () =>
    getChangelogEntries()
      .map(({ page, displayDate }) => `- ${displayDate}: [${page.data.title}](${page.url})${page.data.description ? `. ${page.data.description}` : ''}`)
      .join('\n'),
  DocsIndex: ({ attributes }: PlaceholderData) => {
    const folder = String(attributes.folder) as 'components' | 'blocks';
    const list = (items: DocsIndexItem[]) =>
      items.map((item) => `- [${item.title}](${item.url})${item.description ? `: ${item.description}` : ''}`).join('\n');
    const groups = getDocsIndex(folder);
    if (folder === 'blocks') return list(groups.flatMap((group) => group.items));
    return groups.map((group) => `## ${group.label}\n\n${list(group.items)}`).join('\n\n');
  },
  Steps: ({ children }: PlaceholderData) => children.trim(),
  Step: ({ children }: PlaceholderData) => `${children.trim()}\n`,
  ColorTokens: ({ attributes }: PlaceholderData) =>
    markdownTable(
      ['Class', modeLabels.light, modeLabels.dark, 'Use'],
      colorTokens()
        .filter((color) => color.group === (String(attributes.group) as ColorGroup))
        .map((color) => [code(color.className), code(color.value.light), code(color.value.dark), color.use]),
    ),
  TypeRoles: () =>
    markdownTable(
      ['Role', 'Size', 'Line height', 'Weight', 'Tracking', 'Use'],
      typeRoles().map((role) => [
        code(role.className),
        `${code(role.size)} (${role.sizePx})`,
        `${code(role.lineHeight)} (${role.lineHeightPx})`,
        role.weight,
        code(role.tracking),
        role.use,
      ]),
    ),
  ShadowSurfaces: () =>
    markdownTable(
      ['Shadow', 'Fill', 'Surface', modeLabels.light, modeLabels.dark],
      shadowTokens().map((shadow) => [
        code(shadow.name),
        code(shadow.fill),
        shadow.surface,
        code(shadow.value.light),
        code(shadow.value.dark),
      ]),
    ),
  RadiusScale: () =>
    markdownTable(
      ['Class', 'Value', 'Use'],
      radiusScale().map((radius) => [code(radius.className), `${code(radius.value)} (${radius.px})`, radius.use]),
    ),
  MotionTokens: () =>
    markdownTable(
      ['Token', 'Value', 'Used for'],
      motionTokens().map((token) => [code(token.className), code(token.value), token.use]),
    ),
  // The easing curves are in the MotionTokens table; the demo itself has nothing to read.
  EasingCurves: () => '',
  PackageInstall: ({ attributes }: PlaceholderData) => fence('bash', `${packageInstallers.npm} ${String(attributes.packages)}`),
  LinkCards: ({ children }: PlaceholderData) => children.trim(),
  LinkCard: ({ attributes, children }: PlaceholderData) =>
    `- [${String(attributes.title)}](${String(attributes.href)})${children.trim() ? `: ${children.trim()}` : ''}\n`,
};

type DocsPage = ReturnType<typeof source.getPages>[number];

/** Root-relative links in a page body, made absolute. */
const absoluteLinks = (markdown: string) => markdown.replace(/\]\((\/[^)\s]*)\)/g, (_, path: string) => `](${absolute(path)})`);

/** Where the proxy serves a page as Markdown: its URL plus `.md`. */
const markdownPath = (page: DocsPage) => `${page.url}.md`;

/** A docs page as Markdown: the title, the description as a quote, its address, then the body. */
export async function pageMarkdown(page: DocsPage): Promise<string> {
  const body = await renderPlaceholder(await page.data.getText('processed'), placeholders);
  return [
    `# ${page.data.title}`,
    page.data.description && `> ${page.data.description}`,
    `Source: ${absolute(page.url)}`,
    absoluteLinks(body).trim(),
  ]
    .filter(Boolean)
    .join('\n\n');
}

/** Every page in sidebar order, section by section, then the changelog entries, which sit outside the sidebar. */
function pagesInOrder(): { label: string; pages: DocsPage[] }[] {
  const byUrl = new Map(source.getPages().map((page) => [page.url, page]));
  const pagesOf = (items: { url: string }[]) => items.map((item) => byUrl.get(item.url)!);
  const sections = getDocsNav().sections.flatMap((section) => {
    const ownGroups = section.groups.filter((group) => group.label === section.label);
    const subGroups = section.groups.filter((group) => group.label !== section.label);
    return [
      { label: section.label, pages: pagesOf([...section.items, ...ownGroups.flatMap((group) => group.items)]) },
      ...subGroups.map((group) => ({ label: `${section.label}: ${group.label}`, pages: pagesOf(group.items) })),
    ];
  });
  return [...sections, { label: 'Optional', pages: getChangelogEntries().map((entry) => entry.page) }];
}

/** `/llms.txt`: what Kosmos is, then every page's Markdown address with its description, in sidebar order. */
export function llmsIndex(): string {
  const link = (page: DocsPage) =>
    `- [${page.data.title}](${absolute(markdownPath(page))})${page.data.description ? `: ${page.data.description}` : ''}`;
  return [
    `# ${appName}`,
    `> ${source.getPage([])?.data.description ?? ''}`,
    'Each link below is a docs page as Markdown. The changelog entries under Optional record what shipped and can be skipped.',
    ...pagesInOrder().map(({ label, pages }) => `## ${label}\n\n${pages.map(link).join('\n')}`),
  ].join('\n\n');
}

/** `/llms-full.txt`: every page in full, in the order of `/llms.txt`. */
export async function llmsFull(): Promise<string> {
  const pages = pagesInOrder().flatMap((section) => section.pages);
  return (await Promise.all(pages.map(pageMarkdown))).join('\n\n---\n\n');
}
