'use client';

import { useFetchSearch, type SearchResultItem } from 'fumadocs-core/search/client';
import type { SharedProps } from 'fumadocs-ui/contexts/search';
import {
  BookOpen,
  Check,
  Component,
  Copy,
  FileText,
  Hash,
  History,
  LayoutPanelTop,
  Palette,
  SunMoon,
  SwatchBook,
  TextAlignStart,
  type LucideIcon,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import { createContext, use, useEffect, useMemo, useState, type ComponentType, type ReactNode } from 'react';
import { defaultChoice, presetById, presets } from '@/lib/presets';
import { githubUrl } from '@/lib/shared';
import {
  Command,
  CommandBack,
  CommandCollection,
  CommandDescription,
  CommandDialog,
  CommandEmpty,
  CommandFooter,
  CommandGroup,
  CommandGroupLabel,
  CommandInput,
  CommandItem,
  CommandItemText,
  CommandList,
  CommandLoading,
} from '@/registry/kosmos/ui/command';
import { GitHubIcon } from './brand-icons';
import { PresetSwatch } from './preset-picker';
import type { SearchLabels } from './search-index';
import { useSitePreset } from './site-preset';

type EntryIcon = ComponentType<{ className?: string; 'aria-hidden'?: boolean }>;

/** One row of the palette: a docs hit, a suggested page, or an action. */
type Entry = {
  key: string;
  title: string;
  /** The line under the title: a page's section and description, or the page a heading belongs to. */
  crumb?: string;
  /** The matching text, on a text hit. */
  snippet?: string;
  icon: EntryIcon;
  /** Replaces the icon, such as a preset's swatch. */
  leading?: ReactNode;
  /** What the row does. Rows that navigate close the palette; the rest decide for themselves. */
  run: () => void;
  /** Whether the row is an action rather than a link, which the palette marks with an end label. */
  trailing?: ReactNode;
  /** Whether the query is highlighted in the row: true for a docs hit. */
  matched?: boolean;
};

type EntryGroup = { value: string; label: string; items: Entry[] };

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

const sectionIcons: Record<string, LucideIcon> = {
  Components: Component,
  Blocks: LayoutPanelTop,
  Foundations: Palette,
  Changelog: History,
  Docs: BookOpen,
};

type Hit = Omit<Entry, 'run'> & { url: string; section: string };

/** One hit per result, grouped by the section of the page it is on, in the order the pages first appear. */
function groupHits(items: SearchResultItem[], labels: SearchLabels, open: (url: string) => void): EntryGroup[] {
  const groups = new Map<string, EntryGroup>();
  const seen = new Set<string>();

  for (const item of items) {
    const record = item.type === 'table' ? item.rows[0] : item;
    if (!record) continue;
    const text = item.type === 'table' ? item.rows.map((row) => cleanText(row.hastContent)).join(' · ') : cleanText(item.hastContent);
    const kind = item.type === 'table' || item.type === 'text' ? (text ? 'text' : 'heading') : item.type;
    const pageUrl = record.url.split('#')[0];
    const page = labels.pages[pageUrl];
    const section = page?.section ?? 'Docs';
    const heading = labels.headings[record.url];
    const SectionIcon = sectionIcons[section] ?? FileText;

    const hit: Hit =
      kind === 'page'
        ? { key: '', url: record.url, section, icon: SectionIcon, title: page?.title ?? text, crumb: page?.description }
        : kind === 'heading'
          ? {
              key: '',
              url: record.url,
              section,
              icon: Hash,
              title: (record.type === 'heading' && text) || heading || page?.title || pageUrl,
              crumb: page?.title,
            }
          : {
              key: '',
              url: record.url,
              section,
              icon: TextAlignStart,
              title: heading ?? page?.title ?? pageUrl,
              crumb: heading ? page?.title : undefined,
              snippet: text || undefined,
            };
    hit.key = `${kind}|${hit.url}|${hit.snippet ?? hit.title}`;
    if (seen.has(hit.key)) continue;
    seen.add(hit.key);

    let group = groups.get(section);
    if (!group) {
      group = { value: section, label: section, items: [] };
      groups.set(section, group);
    }
    group.items.push({ ...hit, matched: true, run: () => open(hit.url) });
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

/** The text with each word of the query marked: underlined in a title, set in the foreground color in muted text. */
function highlight(text: string, pattern: RegExp | null, className: string): ReactNode {
  if (!pattern) return text;
  return text.split(pattern).map((part, index) =>
    index % 2 === 1 ? (
      <mark key={index} className={className}>
        {part}
      </mark>
    ) : (
      part
    ),
  );
}

const titleMark = 'bg-transparent text-foreground underline decoration-muted-foreground decoration-1 underline-offset-4';
const mutedMark = 'bg-transparent font-medium text-foreground';

const SearchLabelsContext = createContext<SearchLabels>({ pages: {}, headings: {}, installCommand: '' });
export const SearchLabelsProvider = SearchLabelsContext.Provider;

type Suggestion = { group: string; urls: readonly string[]; icon: LucideIcon };

const suggestions: readonly Suggestion[] = [
  { group: 'Get started', icon: BookOpen, urls: ['/docs', '/docs/installation', '/docs/foundations/color'] },
  { group: 'Components', icon: Component, urls: ['/docs/components/button', '/docs/components/dialog', '/docs/components/select', '/docs/components/command'] },
  { group: 'Blocks', icon: LayoutPanelTop, urls: ['/docs/blocks/data-table', '/docs/blocks/app-sidebar', '/docs/blocks/kanban-board', '/docs/blocks/command-menu'] },
];

const sitePages = [
  { url: '/presets', title: 'Presets', crumb: 'Try a preset on the whole site and copy its code', icon: SwatchBook },
];

type PalettePage = 'presets' | null;

const matches = (text: string, query: string) => text.toLowerCase().includes(query.toLowerCase());

/**
 * The docs search on ⌘K: the Kosmos Command palette over the docs search API. Opened empty, it suggests pages and
 * runs actions (switch the theme or the preset, copy the install command, open GitHub); typed into, it lists
 * matching pages and sections. Enter or a click runs the highlighted row.
 */
export function SearchDialog({ open, onOpenChange }: SharedProps) {
  const labels = use(SearchLabelsContext);
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const [choice, setChoice] = useSitePreset();
  const { search, onSearchChange, isLoading, data, error } = useFetchSearch();
  const [page, setPage] = useState<PalettePage>(null);
  const [presetQuery, setPresetQuery] = useState('');
  const [copied, setCopied] = useState(false);
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (!open) {
      onSearchChange('');
      setPage(null);
      setPresetQuery('');
      setCopied(false);
    }
  }

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 1600);
    return () => clearTimeout(timer);
  }, [copied]);

  const close = () => onOpenChange(false);
  const go = (url: string) => {
    close();
    router.push(url);
  };
  const goOut = (url: string) => {
    close();
    window.open(url, '_blank', 'noopener,noreferrer');
  };
  const goToPage = (next: PalettePage) => {
    setPage(next);
    setPresetQuery('');
    onSearchChange('');
  };

  const query = (page ? presetQuery : search).trim();
  const settled = !isLoading && data?.query === search;
  const pattern = useMemo(() => queryPattern(data?.query ?? ''), [data?.query]);

  const actions: Entry[] = [
    {
      key: 'action:theme',
      title: 'Toggle theme',
      crumb: resolvedTheme === 'dark' ? 'Switch to the light theme' : 'Switch to the dark theme',
      icon: SunMoon,
      run: () => {
        setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
        close();
      },
    },
    {
      key: 'action:preset',
      title: 'Switch preset…',
      crumb: `Now ${presetById(choice.preset).name}`,
      icon: Palette,
      run: () => goToPage('presets'),
    },
    {
      key: 'action:install',
      title: copied ? 'Copied' : 'Copy install command',
      crumb: 'Adds the @kosmos registry to your project',
      icon: copied ? Check : Copy,
      run: () => {
        navigator.clipboard?.writeText(labels.installCommand).then(
          () => setCopied(true),
          () => {},
        );
      },
    },
    { key: 'action:github', title: 'Open GitHub', crumb: 'Source, issues and releases', icon: GitHubIcon, run: () => goOut(githubUrl) },
  ];

  const buildGroups = (): EntryGroup[] => {
    if (page === 'presets') {
      const items = presets
        .filter((preset) => !presetQuery.trim() || matches(preset.name, presetQuery))
        .map((preset): Entry => {
          const current = preset.id === choice.preset;
          return {
            key: `preset:${preset.id}`,
            title: preset.name,
            crumb: preset.description,
            icon: Palette,
            leading: <PresetSwatch preset={preset} />,
            trailing: current ? <Check aria-label="Current preset" className="ms-auto size-4 shrink-0 text-muted-foreground" /> : null,
            run: () => {
              setChoice(defaultChoice(preset));
              onOpenChange(false);
            },
          };
        });
      return items.length ? [{ value: 'Presets', label: 'Presets', items }] : [];
    }

    const matchingActions = query ? actions.filter((action) => matches(action.title, query) || matches(action.crumb ?? '', query)) : actions;
    const actionGroup: EntryGroup[] = matchingActions.length ? [{ value: 'Actions', label: 'Actions', items: matchingActions }] : [];

    if (!query) {
      const pageEntry = (url: string, icon: LucideIcon): Entry => {
        const info = labels.pages[url];
        return { key: `page:${url}`, title: info?.title ?? url, crumb: info?.description, icon, run: () => go(url) };
      };
      return [
        ...suggestions.slice(0, 1).map((s) => ({ value: s.group, label: s.group, items: s.urls.map((url) => pageEntry(url, s.icon)) })),
        ...actionGroup,
        ...suggestions.slice(1).map((s) => ({ value: s.group, label: s.group, items: s.urls.map((url) => pageEntry(url, s.icon)) })),
        {
          value: 'Presets',
          label: 'Presets',
          items: sitePages.map((site) => ({ key: `site:${site.url}`, title: site.title, crumb: site.crumb, icon: site.icon, run: () => go(site.url) })),
        },
      ];
    }

    const docs = data && !error ? groupHits(data.items, labels, go) : [];
    if (docs.length || !settled) return [...actionGroup, ...docs];
    return [
      ...actionGroup,
      {
        value: 'Try instead',
        label: `No docs match “${query}”`,
        items: [
          { key: 'miss:components', title: 'Browse components', icon: Component, run: () => go('/docs/components') },
          { key: 'miss:blocks', title: 'Browse blocks', icon: LayoutPanelTop, run: () => go('/docs/blocks') },
          {
            key: 'miss:github',
            title: `Search GitHub for “${query}”`,
            crumb: 'Issues and discussions',
            icon: GitHubIcon,
            run: () => goOut(`${githubUrl}/issues?q=${encodeURIComponent(query)}`),
          },
        ],
      },
    ];
  };
  const groups = buildGroups();

  const loading = Boolean(query) && !page && !settled && !error && groups.every((group) => group.value === 'Actions');

  return (
    <CommandDialog
      open={open}
      onOpenChange={(next, details) => {
        if (!next && details.reason === 'escape-key' && page) {
          details.cancel();
          goToPage(null);
          return;
        }
        onOpenChange(next);
      }}
      title="Search docs"
      description="Find a docs page by its title, a heading or its text, or run an action."
    >
      <Command
        items={groups}
        mode="none"
        value={page ? presetQuery : search}
        onValueChange={(value) => (page ? setPresetQuery(value) : onSearchChange(value))}
        itemToStringValue={(entry: Entry) => entry.title}
      >
        {page ? <CommandBack title="Switch preset" onBack={() => goToPage(null)} /> : null}
        <CommandInput
          aria-label={page ? 'Switch preset' : 'Search docs'}
          placeholder={page ? 'Pick a preset…' : 'Search docs or run an action…'}
          onKeyDown={(event) => {
            if (page && event.key === 'Backspace' && !presetQuery) {
              event.preventDefault();
              goToPage(null);
            }
          }}
        />
        {loading ? (
          <CommandLoading>Searching…</CommandLoading>
        ) : (
          <CommandEmpty>
            {error
              ? 'Unable to search right now. Check your connection and try again.'
              : page
                ? `No preset matches “${query}”.`
                : null}
          </CommandEmpty>
        )}
        <CommandList className={loading ? 'hidden' : undefined}>
          {(group: EntryGroup) => (
            <CommandGroup key={group.value} items={group.items}>
              <CommandGroupLabel>{group.label}</CommandGroupLabel>
              <CommandCollection>
                {(entry: Entry) => {
                  const Icon = entry.icon;
                  const titled = entry.matched ? highlight(entry.title, pattern, titleMark) : entry.title;
                  return (
                    <CommandItem key={entry.key} value={entry} onClick={entry.run} className="items-start">
                      {entry.leading ? <span className="mt-0.5 flex size-4 items-center justify-center">{entry.leading}</span> : <Icon aria-hidden className="mt-0.5" />}
                      <CommandItemText>
                        <span className="truncate">{titled}</span>
                        {entry.crumb ? (
                          <CommandDescription>{entry.matched ? highlight(entry.crumb, pattern, mutedMark) : entry.crumb}</CommandDescription>
                        ) : null}
                        {entry.snippet ? (
                          <CommandDescription className="line-clamp-2 whitespace-normal">
                            {highlight(entry.snippet, pattern, mutedMark)}
                          </CommandDescription>
                        ) : null}
                      </CommandItemText>
                      {entry.trailing}
                    </CommandItem>
                  );
                }}
              </CommandCollection>
            </CommandGroup>
          )}
        </CommandList>
        <CommandFooter back={Boolean(page)} />
      </Command>
    </CommandDialog>
  );
}
