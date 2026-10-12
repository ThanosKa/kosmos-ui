'use client';

import { useFetchSearch, type SearchResultItem } from 'fumadocs-core/search/client';
import type { SharedProps } from 'fumadocs-ui/contexts/search';
import { ArrowDown, ArrowUp, CornerDownLeft, FileText, Hash, TextAlignStart } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createContext, use, useMemo, useState, type ReactNode } from 'react';
import {
  Command,
  CommandCollection,
  CommandDialog,
  CommandEmpty,
  CommandFooter,
  CommandGroup,
  CommandGroupLabel,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/registry/kosmos/ui/command';
import { Kbd, KbdGroup } from '@/registry/kosmos/ui/kbd';
import type { SearchLabels } from './search-index';

type Hit = {
  key: string;
  url: string;
  kind: 'page' | 'heading' | 'text';
  title: string;
  /** The page's section, on a page hit. */
  crumb?: string;
  /** The matching text, on a text hit. */
  snippet?: string;
};

type HitGroup = { value: string; label: string; items: Hit[] };

type HastNode = { type: string; value?: string; tagName?: string; children?: HastNode[] };

const cellTags = new Set(['td', 'th']);

/** The readable text of a parsed result. JSX the index kept as raw markup parses to `custom` elements and is dropped. */
function plainText(node: HastNode): string {
  if (node.type === 'text') return node.value ?? '';
  if (node.type !== 'root' && node.type !== 'element') return '';
  if (node.tagName === 'custom') return '';
  const text = (node.children ?? []).map(plainText).join('');
  return node.tagName && cellTags.has(node.tagName) ? ` ${text} ·` : text;
}

function cleanText(node: HastNode) {
  return plainText(node)
    .replace(/\s+/g, ' ')
    .replace(/^[\s·]+|[\s·]+$/g, '');
}

/** One hit per result, grouped by page in the order the pages first appear. */
function groupHits(items: SearchResultItem[], labels: SearchLabels): HitGroup[] {
  const groups = new Map<string, HitGroup>();
  const seen = new Set<string>();

  for (const item of items) {
    const record = item.type === 'table' ? item.rows[0] : item;
    if (!record) continue;
    const text = item.type === 'table' ? item.rows.map((row) => cleanText(row.hastContent)).join(' · ') : cleanText(item.hastContent);
    const kind = item.type === 'table' || item.type === 'text' ? (text ? 'text' : 'heading') : item.type;
    const pageUrl = record.url.split('#')[0];
    const page = labels.pages[pageUrl];
    const heading = labels.headings[record.url];

    const hit: Hit =
      kind === 'page'
        ? { key: '', url: record.url, kind, title: page?.title ?? text, crumb: page?.section }
        : kind === 'heading'
          ? { key: '', url: record.url, kind, title: (record.type === 'heading' && text) || heading || page?.title || pageUrl }
          : { key: '', url: record.url, kind, title: heading ?? page?.title ?? pageUrl, snippet: text || undefined };
    hit.key = `${hit.kind}|${hit.url}|${hit.snippet ?? hit.title}`;
    if (seen.has(hit.key)) continue;
    seen.add(hit.key);

    let group = groups.get(pageUrl);
    if (!group) {
      group = { value: pageUrl, label: page?.title ?? (kind === 'page' ? text : pageUrl), items: [] };
      groups.set(pageUrl, group);
    }
    group.items.push(hit);
  }
  return [...groups.values()];
}

function queryPattern(query: string) {
  const terms = query
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((term) => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  return terms.length ? new RegExp(`(${terms.join('|')})`, 'gi') : null;
}

/** The text with each word of the query set in the foreground color. */
function highlight(text: string, pattern: RegExp | null): ReactNode {
  if (!pattern) return text;
  return text.split(pattern).map((part, index) =>
    index % 2 === 1 ? (
      <mark key={index} className="bg-transparent font-medium text-foreground">
        {part}
      </mark>
    ) : (
      part
    ),
  );
}

const kindIcons = { page: FileText, heading: Hash, text: TextAlignStart };

const SearchLabelsContext = createContext<SearchLabels>({ pages: {}, headings: {} });
export const SearchLabelsProvider = SearchLabelsContext.Provider;

/**
 * The docs search on ⌘K: the Kosmos Command palette over the docs search API. Opening it starts from an
 * empty field; Enter or a click opens the highlighted page or section.
 */
export function SearchDialog({ open, onOpenChange }: SharedProps) {
  const labels = use(SearchLabelsContext);
  const router = useRouter();
  const { search, onSearchChange, isLoading, data, error } = useFetchSearch();
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (!open) onSearchChange('');
  }

  const query = search.trim();
  const groups = useMemo(() => (query && data && !error ? groupHits(data.items, labels) : []), [query, data, error, labels]);
  const pattern = useMemo(() => queryPattern(data?.query ?? ''), [data?.query]);
  const settled = !isLoading && data?.query === search;

  const go = (url: string) => {
    onOpenChange(false);
    router.push(url);
  };

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Search docs"
      description="Find a docs page by its title, a heading or its text."
    >
      <Command items={groups} mode="none" value={search} onValueChange={(value) => onSearchChange(value)} itemToStringValue={(hit: Hit) => hit.title}>
        <CommandInput aria-label="Search docs" placeholder="Search docs…" />
        <CommandEmpty>
          {error
            ? 'Unable to search right now. Check your connection and try again.'
            : query && settled
              ? `No results for “${query}”. Try a component name, such as Button.`
              : null}
        </CommandEmpty>
        <CommandList>
          {(group: HitGroup) => (
            <CommandGroup key={group.value} items={group.items}>
              <CommandGroupLabel>{group.label}</CommandGroupLabel>
              <CommandCollection>
                {(hit: Hit) => {
                  const Icon = kindIcons[hit.kind];
                  return (
                    <CommandItem key={hit.key} value={hit} onClick={() => go(hit.url)} className="items-start">
                      <Icon aria-hidden className="mt-0.5" />
                      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                        <span className="truncate">{hit.title}</span>
                        {hit.crumb ? (
                          <span className="truncate text-small font-normal text-muted-foreground">{hit.crumb}</span>
                        ) : null}
                        {hit.snippet ? (
                          <span className="line-clamp-2 text-small font-normal text-muted-foreground">
                            {highlight(hit.snippet, pattern)}
                          </span>
                        ) : null}
                      </span>
                    </CommandItem>
                  );
                }}
              </CommandCollection>
            </CommandGroup>
          )}
        </CommandList>
        <CommandFooter>
          <span className="flex items-center gap-1.5">
            <KbdGroup>
              <Kbd>
                <ArrowUp role="img" aria-label="Up arrow" />
              </Kbd>
              <Kbd>
                <ArrowDown role="img" aria-label="Down arrow" />
              </Kbd>
            </KbdGroup>
            Move
          </span>
          <span className="flex items-center gap-1.5">
            <Kbd>
              <CornerDownLeft role="img" aria-label="Enter" />
            </Kbd>
            Open
          </span>
          <span className="flex items-center gap-1.5">
            <Kbd>Esc</Kbd>
            Close
          </span>
        </CommandFooter>
      </Command>
    </CommandDialog>
  );
}
