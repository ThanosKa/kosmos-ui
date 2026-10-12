import { docsSectionTitle } from '@/lib/shared';
import { source } from '@/lib/source';

/**
 * What the search dialog needs to label a hit that the search API returns bare: the title and section of
 * every docs page, and the text of every heading by its URL (`/docs/components/button#api`).
 */
export type SearchLabels = {
  pages: Record<string, { title: string; section: string }>;
  headings: Record<string, string>;
};

const inlineMarkdown = /[`*_]/g;

/** Server only: reads every docs page. */
export function getSearchLabels(): SearchLabels {
  const labels: SearchLabels = { pages: {}, headings: {} };
  for (const page of source.getPages()) {
    labels.pages[page.url] = { title: page.data.title, section: docsSectionTitle(page.slugs) };
    for (const heading of page.data.structuredData.headings) {
      labels.headings[`${page.url}#${heading.id}`] = heading.content.replace(inlineMarkdown, '');
    }
  }
  return labels;
}
