import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { llms } from 'fumadocs-core/source';
import { renderPlaceholder, type PlaceholderData } from 'fumadocs-core/mdx-plugins/remark-llms.runtime';
import { readExampleSource } from './examples';
import { getChangelogEntries } from './changelog';
import { colorTokens, motionTokens, radiusScale, shadowTokens, typeRoles, type ColorGroup } from './foundations';
import {
  cssVarsAsCss,
  getRegistryItem,
  installCommands,
  installedPath,
  packageRunners,
  registryAddArgs,
  registryConfig,
  resolveRegistryTree,
  toInstalledImports,
} from './registry';
import { source } from './source';

const fence = (lang: string, code: string, title?: string) =>
  `\`\`\`${lang}${title ? ` title="${title}"` : ''}\n${code.trimEnd()}\n\`\`\``;

const code = (value: string) => `\`${value}\``;

function markdownTable(head: string[], rows: string[][]) {
  return [head, head.map(() => '---'), ...rows].map((cells) => `| ${cells.join(' | ')} |`).join('\n');
}

const nameOf = ({ attributes }: PlaceholderData) => String(attributes.name ?? '');

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
  DocsIndex: ({ attributes }: PlaceholderData) =>
    source
      .getPages()
      .filter((page) => page.slugs.length === 2 && page.slugs[0] === String(attributes.folder))
      .sort((a, b) => a.data.title.localeCompare(b.data.title))
      .map((page) => `- [${page.data.title}](${page.url})${page.data.description ? `: ${page.data.description}` : ''}`)
      .join('\n'),
  Steps: ({ children }: PlaceholderData) => children.trim(),
  Step: ({ children }: PlaceholderData) => `${children.trim()}\n`,
  ColorTokens: ({ attributes }: PlaceholderData) =>
    markdownTable(
      ['Class', 'Light', 'Dark', 'Use'],
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
      ['Shadow', 'Fill', 'Surface', 'Light', 'Dark'],
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
};

export const docsLlms = llms(source, {
  renderPage: async (page) => `# ${page.data.title} (${page.url})

${await renderPlaceholder(await page.data.getText('processed'), placeholders)}`,
});
