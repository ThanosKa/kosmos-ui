import { createFromSource } from 'fumadocs-core/search/server';
import type { StructuredData } from 'fumadocs-core/mdx-plugins';
import type { SortedResult } from 'fumadocs-core/search';
import { changelogFolder } from '@/lib/changelog';
import { docsRoute } from '@/lib/shared';
import { source, type DocsPage } from '@/lib/source';

/** Markdown read as plain text: code, emphasis and link syntax removed. */
const plainText = (markdown: string) =>
  markdown
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/`|\*/g, '')
    .trim();

/** A table row as its cells, without the header row the record repeats. */
const tableRowText = (markdown: string) =>
  (markdown.trim().split('\n').at(-1) ?? '')
    .split('|')
    .map((cell) => plainText(cell))
    .filter(Boolean)
    .join(' · ');

/**
 * The page's text as search records: JSX the MDX keeps as source (API tables, previews) is dropped, Markdown syntax
 * is stripped, table rows become plain text, and a paragraph that repeats the page description or an earlier one is indexed once.
 */
function searchableData(data: StructuredData, description?: string): StructuredData {
  const seen = new Set(description ? [plainText(description)] : []);
  const contents = data.contents.flatMap(({ heading, content: markdown, table }) => {
    if (/^<[A-Z]/.test(markdown)) return [];
    const content = table ? tableRowText(markdown) : plainText(markdown);
    if (!content || seen.has(content)) return [];
    seen.add(content);
    return [{ heading, content }];
  });
  return { headings: data.headings.map((heading) => ({ ...heading, content: plainText(heading.content) })), contents };
}

const isChangelogEntry = (url: string) => url.startsWith(`${docsRoute}/${changelogFolder}/`);

const api = createFromSource(source, {
  async buildIndex(page: DocsPage) {
    const { structuredData, title, description } = page.data;
    return { id: page.url, url: page.url, title, description, structuredData: searchableData(structuredData, description) };
  },
});

/** Results grouped by page, with changelog entries after the pages they mention, so "button" finds Button first. */
function changelogLast(results: SortedResult[]): SortedResult[] {
  const groups: SortedResult[][] = [];
  for (const result of results) {
    if (result.type === 'page' || groups.length === 0) groups.push([]);
    groups.at(-1)!.push(result);
  }
  return [...groups.filter((group) => !isChangelogEntry(group[0].url)), ...groups.filter((group) => isChangelogEntry(group[0].url))].flat();
}

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const query = params.get('query') ?? '';
  const tag = params.get('tag')?.split(',') ?? undefined;
  const locale = params.get('locale') ?? undefined;
  return Response.json(changelogLast(await api.search(query, { tag, locale })));
}
