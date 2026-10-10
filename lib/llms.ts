import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { llms } from 'fumadocs-core/source';
import { renderPlaceholder, type PlaceholderData } from 'fumadocs-core/mdx-plugins/remark-llms.runtime';
import { readExampleSource } from './examples';
import { installCommands, installedPath, resolveRegistryTree, toInstalledImports } from './registry';
import { source } from './source';

const fence = (lang: string, code: string, title?: string) =>
  `\`\`\`${lang}${title ? ` title="${title}"` : ''}\n${code.trimEnd()}\n\`\`\``;

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
};

export const docsLlms = llms(source, {
  renderPage: async (page) => `# ${page.data.title} (${page.url})

${await renderPlaceholder(await page.data.getText('processed'), placeholders)}`,
});
