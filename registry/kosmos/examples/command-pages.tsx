'use client';

import { Laptop, Moon, Palette, Settings, Sun, type LucideIcon } from 'lucide-react';
import { useState } from 'react';
import {
  Command,
  CommandBack,
  CommandCollection,
  CommandDescription,
  CommandEmpty,
  CommandFooter,
  CommandGroup,
  CommandGroupLabel,
  CommandInput,
  CommandItem,
  CommandItemText,
  CommandList,
} from '@/registry/kosmos/ui/command';

type Item = { value: string; label: string; description?: string; icon: LucideIcon; page?: string };
type Group = { value: string; items: Item[] };

const home: Group[] = [
  {
    value: 'Preferences',
    items: [
      { value: 'theme', label: 'Change theme…', description: 'Light, dark or follow your system', icon: Palette, page: 'theme' },
      { value: 'settings', label: 'Open settings', icon: Settings },
    ],
  },
];

const pages: Record<string, { title: string; groups: Group[] }> = {
  theme: {
    title: 'Change theme',
    groups: [
      {
        value: 'Theme',
        items: [
          { value: 'light', label: 'Light', icon: Sun },
          { value: 'dark', label: 'Dark', icon: Moon },
          { value: 'system', label: 'System', icon: Laptop },
        ],
      },
    ],
  },
};

/** An item with a `page` opens a second list; Back, Backspace in the empty field and Escape return. */
export default function CommandPages({ defaultPage = null }: { defaultPage?: string | null }) {
  const [page, setPage] = useState<string | null>(defaultPage);
  const [query, setQuery] = useState('');
  const current = page ? pages[page] : undefined;

  const goTo = (next: string | null) => {
    setPage(next);
    setQuery('');
  };

  return (
    <Command
      items={current ? current.groups : home}
      value={query}
      onValueChange={(value) => setQuery(value)}
      className="max-w-md"
    >
      {current ? <CommandBack title={current.title} onBack={() => goTo(null)} /> : null}
      <CommandInput
        placeholder={current ? 'Pick a theme…' : 'Search preferences…'}
        aria-label={current ? current.title : 'Search preferences'}
        onKeyDown={(event) => {
          if (current && (event.key === 'Backspace' ? query === '' : event.key === 'Escape')) {
            event.preventDefault();
            goTo(null);
          }
        }}
      />
      <CommandEmpty>No results found.</CommandEmpty>
      <CommandList>
        {(group: Group) => (
          <CommandGroup key={group.value} items={group.items}>
            <CommandGroupLabel>{group.value}</CommandGroupLabel>
            <CommandCollection>
              {(item: Item) => (
                <CommandItem key={item.value} value={item} onClick={() => (item.page ? goTo(item.page) : undefined)}>
                  <item.icon />
                  {item.description ? (
                    <CommandItemText>
                      <span className="truncate">{item.label}</span>
                      <CommandDescription>{item.description}</CommandDescription>
                    </CommandItemText>
                  ) : (
                    item.label
                  )}
                </CommandItem>
              )}
            </CommandCollection>
          </CommandGroup>
        )}
      </CommandList>
      <CommandFooter back={Boolean(current)} />
    </Command>
  );
}
