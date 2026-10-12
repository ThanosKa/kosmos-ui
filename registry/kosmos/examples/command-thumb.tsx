'use client';

import { FilePlus, LayoutDashboard, Settings, UserPlus, Users, type LucideIcon } from 'lucide-react';
import { ThumbStage } from '@/components/preview/overlay-stage';
import {
  Command,
  CommandCollection,
  CommandDialog,
  CommandGroup,
  CommandGroupLabel,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from '@/registry/kosmos/ui/command';
import { Kbd } from '@/registry/kosmos/ui/kbd';

type Item = { value: string; label: string; icon: LucideIcon; shortcut?: string[] };
type Group = { value: string; items: Item[] };

const groups: Group[] = [
  {
    value: 'Suggestions',
    items: [
      { value: 'new-project', label: 'Create project', icon: FilePlus, shortcut: ['C'] },
      { value: 'invite', label: 'Invite people', icon: UserPlus, shortcut: ['I'] },
    ],
  },
  {
    value: 'Go to',
    items: [
      { value: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, shortcut: ['G', 'D'] },
      { value: 'members', label: 'Members', icon: Users, shortcut: ['G', 'M'] },
      { value: 'settings', label: 'Settings', icon: Settings, shortcut: ['⌘', ','] },
    ],
  },
];

/** The components index thumbnail: the palette open, first match highlighted. */
export default function CommandThumb() {
  return (
    <ThumbStage className="h-72 max-w-xl">
      {(container) => (
        <CommandDialog open modal={false} container={container} initialFocus={false}>
          <Command items={groups}>
            <CommandInput placeholder="Search for a command…" />
            <CommandList>
              {(group: Group) => (
                <CommandGroup key={group.value} items={group.items}>
                  <CommandGroupLabel>{group.value}</CommandGroupLabel>
                  <CommandCollection>
                    {(item: Item) => (
                      <CommandItem key={item.value} value={item}>
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
          </Command>
        </CommandDialog>
      )}
    </ThumbStage>
  );
}
