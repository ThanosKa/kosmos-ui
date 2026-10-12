'use client';

import { Calendar, FilePlus, FolderKanban, LayoutDashboard, Search, Settings, UserPlus, type LucideIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/registry/kosmos/ui/button';
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
  CommandShortcut,
} from '@/registry/kosmos/ui/command';
import { Kbd, KbdGroup } from '@/registry/kosmos/ui/kbd';

type Item = { value: string; label: string; icon: LucideIcon; shortcut?: string[] };
type Group = { value: string; items: Item[] };

const groups: Group[] = [
  {
    value: 'Go to',
    items: [
      { value: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, shortcut: ['G', 'D'] },
      { value: 'projects', label: 'Projects', icon: FolderKanban, shortcut: ['G', 'P'] },
      { value: 'calendar', label: 'Calendar', icon: Calendar },
    ],
  },
  {
    value: 'Actions',
    items: [
      { value: 'new-task', label: 'Create task', icon: FilePlus, shortcut: ['C'] },
      { value: 'invite', label: 'Invite people', icon: UserPlus },
      { value: 'settings', label: 'Open settings', icon: Settings, shortcut: ['⌘', ','] },
    ],
  },
];

export default function CommandDemo() {
  const [open, setOpen] = useState(false);

  // ⌘J on a Mac, Ctrl+J elsewhere, toggles the palette from anywhere on the page.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'j' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen((value) => !value);
      }
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <>
      <Button
        variant="secondary"
        className="w-56 justify-between ps-2.5 pe-1.5 font-normal text-muted-foreground"
        onClick={() => setOpen(true)}
      >
        <span className="flex items-center gap-2">
          <Search aria-hidden />
          Search
        </span>
        <KbdGroup>
          <Kbd>⌘</Kbd>
          <Kbd>J</Kbd>
        </KbdGroup>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <Command items={groups}>
          <CommandInput placeholder="Search for a command…" />
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandList>
            {(group: Group) => (
              <CommandGroup key={group.value} items={group.items}>
                <CommandGroupLabel>{group.value}</CommandGroupLabel>
                <CommandCollection>
                  {(item: Item) => (
                    <CommandItem key={item.value} value={item} onClick={() => setOpen(false)}>
                      <item.icon />
                      {item.label}
                      {item.shortcut ? (
                        <CommandShortcut>
                          {item.shortcut.map((key) => (
                            <Kbd key={key}>{key}</Kbd>
                          ))}
                        </CommandShortcut>
                      ) : null}
                    </CommandItem>
                  )}
                </CommandCollection>
              </CommandGroup>
            )}
          </CommandList>
          <CommandFooter />
        </Command>
      </CommandDialog>
    </>
  );
}
