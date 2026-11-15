'use client';

import {
  Calendar,
  FilePlus,
  FolderKanban,
  LayoutDashboard,
  Moon,
  Search,
  Settings,
  UserPlus,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { OverlayStage, OverlayStageGrid } from '@/components/preview/overlay-stage';
import { PreviewSection, PreviewStack } from '@/components/preview/preview-section';
import CommandLoadingExample from '@/registry/kosmos/examples/command-loading';
import CommandPages from '@/registry/kosmos/examples/command-pages';
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
      { value: 'members', label: 'Members', icon: Users },
    ],
  },
  {
    value: 'Actions',
    items: [
      { value: 'new-project', label: 'New project', icon: FilePlus, shortcut: ['C'] },
      { value: 'invite', label: 'Invite teammates to the Acme Staging workspace', icon: UserPlus },
      { value: 'theme', label: 'Switch theme', icon: Moon },
      { value: 'settings', label: 'Open settings', icon: Settings, shortcut: ['⌘', ','] },
    ],
  },
];

function Items({ onRun }: { onRun?: () => void }) {
  return (
    <>
      <CommandEmpty>No results found.</CommandEmpty>
      <CommandList>
        {(group: Group) => (
          <CommandGroup key={group.value} items={group.items}>
            <CommandGroupLabel>{group.value}</CommandGroupLabel>
            <CommandCollection>
              {(item: Item) => (
                <CommandItem key={item.value} value={item} onClick={onRun}>
                  <item.icon />
                  <span className="min-w-0 wrap-break-word">{item.label}</span>
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
    </>
  );
}

export default function CommandPreview() {
  return (
    <PreviewStack>
      <PreviewSection title="Open (palette)">
        <OverlayStageGrid>
          <OverlayStage label="groups, first match highlighted, shortcuts, footer">
            {(container) => (
              <CommandDialog open modal={false} container={container} initialFocus={false}>
                <Command items={groups}>
                  <CommandInput placeholder="Search for a command…" />
                  <Items />
                  <CommandFooter />
                </Command>
              </CommandDialog>
            )}
          </OverlayStage>

          <OverlayStage label="query with no match">
            {(container) => (
              <CommandDialog open modal={false} container={container} initialFocus={false}>
                <Command items={groups} defaultValue="Quarterly report">
                  <CommandInput placeholder="Search for a command…" />
                  <Items />
                  <CommandFooter />
                </Command>
              </CommandDialog>
            )}
          </OverlayStage>

          <OverlayStage label="query narrows the list">
            {(container) => (
              <CommandDialog open modal={false} container={container} initialFocus={false}>
                <Command items={groups} defaultValue="in">
                  <CommandInput placeholder="Search for a command…" />
                  <Items />
                </Command>
              </CommandDialog>
            )}
          </OverlayStage>

          <OverlayStage label="loading">{() => <CommandLoadingExample forceLoading />}</OverlayStage>

          <OverlayStage label="nested page with back step">{() => <CommandPages defaultPage="theme" />}</OverlayStage>

          <OverlayStage label="inline (no dialog)">
            {() => (
              <Command items={groups} className="max-w-md">
                <CommandInput placeholder="Search for a command…" aria-label="Search commands" />
                <Items />
              </Command>
            )}
          </OverlayStage>
        </OverlayStageGrid>
      </PreviewSection>

      <PreviewSection title="Live (⌘K or the button)">
        <LivePalette />
      </PreviewSection>
    </PreviewStack>
  );
}

function LivePalette() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'k' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen((value) => !value);
      }
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);
  return (
    <div className="flex flex-wrap items-center gap-3">
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
          <Kbd>K</Kbd>
        </KbdGroup>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <Command items={groups}>
          <CommandInput placeholder="Search for a command…" />
          <Items onRun={() => setOpen(false)} />
          <CommandFooter />
        </Command>
      </CommandDialog>
    </div>
  );
}
