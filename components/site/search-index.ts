import { registryAddArgs } from '@/lib/registry';
import { docsSectionTitle } from '@/lib/shared';
import { source } from '@/lib/source';

/**
 * What the search dialog needs that the search API does not return: the title, section and description of every
 * docs page, the text of every heading by its URL (`/docs/components/button#api`), and the install command it copies.
 */
export type SearchLabels = {
  pages: Record<string, { title: string; section: string; description?: string }>;
  headings: Record<string, string>;
  installCommand: string;
};

const inlineMarkdown = /[`*_]/g;

/** Server only: reads every docs page. */
export function getSearchLabels(): SearchLabels {
  const labels: SearchLabels = { pages: {}, headings: {}, installCommand: `npx shadcn@latest ${registryAddArgs}` };
  for (const page of source.getPages()) {
    labels.pages[page.url] = {
      title: page.data.title,
      section: docsSectionTitle(page.slugs),
      description: page.data.description?.replace(inlineMarkdown, ''),
    };
    for (const heading of page.data.structuredData.headings) {
      labels.headings[`${page.url}#${heading.id}`] = heading.content.replace(inlineMarkdown, '');
    }
  }
  return labels;
}
