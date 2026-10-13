'use client';

import { CheckboxGroup } from '@base-ui/react/checkbox-group';
import {
  Archive,
  ChevronDown,
  Copy,
  FilePlus,
  FolderInput,
  FolderKanban,
  Link2,
  Pencil,
  Settings,
  Share2,
  Trash2,
  UserPlus,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { GalleryCard, GalleryStage, StageBackdropRows } from '@/components/gallery/gallery-card';
import { Button } from '@/registry/kosmos/ui/button';
import { Checkbox } from '@/registry/kosmos/ui/checkbox';
import {
  Command,
  CommandCollection,
  CommandEmpty,
  CommandFooter,
  CommandGroup,
  CommandGroupLabel,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from '@/registry/kosmos/ui/command';
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/registry/kosmos/ui/dialog';
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/registry/kosmos/ui/drawer';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPopup,
  DropdownMenuPortal,
  DropdownMenuPositioner,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/registry/kosmos/ui/dropdown-menu';
import { Field, FieldItem, FieldLabel } from '@/registry/kosmos/ui/field';
import { Input } from '@/registry/kosmos/ui/input';
import { Kbd } from '@/registry/kosmos/ui/kbd';
import {
  Popover,
  PopoverDescription,
  PopoverHeader,
  PopoverPopup,
  PopoverPortal,
  PopoverPositioner,
  PopoverTitle,
  PopoverTrigger,
} from '@/registry/kosmos/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/registry/kosmos/ui/select';
import { Toaster, createToastManager, toast } from '@/registry/kosmos/ui/toast';

/** A pinned overlay keeps the side it was given, wherever the stage sits on the page. */
const pinnedPlacement = { side: 'none', align: 'none', fallbackAxisSide: 'none' } as const;

type CommandEntry = { value: string; label: string; icon: LucideIcon; shortcut?: string[] };
type CommandSection = { value: string; items: CommandEntry[] };

const commandGroups: CommandSection[] = [
  {
    value: 'Suggestions',
    items: [
      { value: 'new-project', label: 'New project', icon: FilePlus, shortcut: ['C'] },
      { value: 'invite', label: 'Invite teammate', icon: UserPlus, shortcut: ['I'] },
    ],
  },
  {
    value: 'Go to',
    items: [
      { value: 'projects', label: 'Projects', icon: FolderKanban, shortcut: ['G', 'P'] },
      { value: 'members', label: 'Members', icon: Users, shortcut: ['G', 'M'] },
      { value: 'settings', label: 'Settings', icon: Settings, shortcut: ['⌘', ','] },
    ],
  },
];

/** Command inline, CommandShortcut with Kbd, CommandFooter. */
export function CommandCard() {
  return (
    <GalleryCard title="Command" description="Search inline; the same parts make the ⌘K palette.">
      <Command items={commandGroups}>
        <CommandInput placeholder="Search for a command…" aria-label="Search for a command" />
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandList>
          {(group: CommandSection) => (
            <CommandGroup key={group.value} items={group.items}>
              <CommandGroupLabel>{group.value}</CommandGroupLabel>
              <CommandCollection>
                {(item: CommandEntry) => (
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
        <CommandFooter />
      </Command>
    </GalleryCard>
  );
}

/** DropdownMenu pinned open: label, highlighted item, shortcuts, submenu trigger, disabled, checkbox, destructive. */
export function MenuStage() {
  const [pinned, setPinned] = useState(true);
  return (
    <GalleryStage title="Menu" description="Actions for a saved view." stageClassName="h-[21.5rem]">
      {(container) => (
        <DropdownMenu open modal={false}>
          <DropdownMenuTrigger render={<Button variant="secondary" />}>
            Scale plan
            <ChevronDown data-icon="inline-end" />
          </DropdownMenuTrigger>
          {/* Parts instead of DropdownMenuContent: the pinned menu must not flip or shrink when the stage is
              below the fold, since collisions are measured against the browser window. */}
          <DropdownMenuPortal container={container}>
            <DropdownMenuPositioner side="bottom" align="start" collisionAvoidance={pinnedPlacement}>
              <DropdownMenuPopup className="max-h-none w-60">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>View</DropdownMenuLabel>
                  {/* Pinned: a real item highlights on hover or with the arrow keys. */}
                  <DropdownMenuItem className="bg-accent">
                    <Pencil />
                    Rename
                    <DropdownMenuShortcut><Kbd>⌘</Kbd><Kbd>R</Kbd></DropdownMenuShortcut>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Copy />
                    Duplicate
                    <DropdownMenuShortcut><Kbd>⌘</Kbd><Kbd>D</Kbd></DropdownMenuShortcut>
                  </DropdownMenuItem>
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                      <FolderInput />
                      Move to
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                      <DropdownMenuItem>Growth</DropdownMenuItem>
                      <DropdownMenuItem>Product</DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                  <DropdownMenuItem disabled>
                    <Share2 />
                    Share with guests
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem checked={pinned} onCheckedChange={setPinned}>
                  Pin to sidebar
                </DropdownMenuCheckboxItem>
                <DropdownMenuItem>
                  <Archive />
                  Archive
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive">
                  <Trash2 />
                  Delete view
                  <DropdownMenuShortcut><Kbd>⌘</Kbd><Kbd>⌫</Kbd></DropdownMenuShortcut>
                </DropdownMenuItem>
              </DropdownMenuPopup>
            </DropdownMenuPositioner>
          </DropdownMenuPortal>
        </DropdownMenu>
      )}
    </GalleryStage>
  );
}

const access = { view: 'Anyone with the link can view', comment: 'Anyone with the link can comment', none: 'Only invited members' };

/** Popover pinned open, with an Input and a Select inside. */
export function ShareStage() {
  return (
    <GalleryStage title="Popover" description="Share a report without leaving the page." stageClassName="h-[18rem]">
      {(container) => (
        <div className="flex justify-end">
          <Popover open>
            <PopoverTrigger render={<Button variant="secondary" />}>
              <Share2 data-icon="inline-start" />
              Share
            </PopoverTrigger>
            <PopoverPortal container={container}>
              <PopoverPositioner side="bottom" align="end" collisionAvoidance={pinnedPlacement}>
                <PopoverPopup initialFocus={false} className="max-h-none">
                  <PopoverHeader>
                    <PopoverTitle>Share the weekly events report</PopoverTitle>
                    <PopoverDescription>People with access see live numbers, not a copy.</PopoverDescription>
                  </PopoverHeader>
                  <div className="flex gap-2">
                    <Input readOnly aria-label="Report link" defaultValue="parallax.example/r/weekly-events" className="h-7.5" />
                    <Button variant="secondary" size="icon" aria-label="Copy link">
                      <Link2 />
                    </Button>
                  </div>
                  <Select items={access} defaultValue="view">
                    <SelectTrigger aria-label="Link access">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(access).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </PopoverPopup>
              </PopoverPositioner>
            </PopoverPortal>
          </Popover>
        </div>
      )}
    </GalleryStage>
  );
}

type ToastOptions = Parameters<ReturnType<typeof createToastManager>['add']>[0];

const pinnedToasts: ToastOptions[] = [
  { type: 'info', title: 'Ama Mensah joined Parallax Staging', description: 'She can see every shared view.' },
  { type: 'success', title: 'Invoice INV-2041 sent', description: 'Fernhill Books will get it by email.' },
  { type: 'error', title: 'Export failed', description: 'events-q3.csv is larger than 25 MB.', actionProps: { children: 'Retry' } },
];

function PinnedToasts({ container }: { container: HTMLElement }) {
  const [manager] = useState(() => createToastManager());
  useEffect(() => {
    // Ids keep a second run (React strict mode) from adding the toasts twice.
    pinnedToasts.forEach((options, index) => manager.add({ id: `gallery-toast-${index}`, timeout: 0, ...options }));
  }, [manager]);
  return <Toaster toastManager={manager} container={container} />;
}

/** Toast stack pinned open, and a button that adds a live toast to the page's Toaster. */
export function ToastStage() {
  return (
    <GalleryStage
      title="Toasts"
      description="Stacked in the corner; hover to spread them."
      stageClassName="h-[21rem]"
      action={
        <Button
          variant="secondary"
          size="sm"
          onClick={() => toast.add({ type: 'success', title: 'Changes saved', description: 'Your profile is up to date.' })}
        >
          Show toast
        </Button>
      }
    >
      {(container) => <PinnedToasts container={container} />}
    </GalleryStage>
  );
}

/** Dialog pinned open over a scrim: a confirmation with a destructive action. */
export function DialogStage() {
  return (
    <GalleryStage title="Dialog" description="A confirmation before a change that cannot be undone." stageClassName="h-[20rem]">
      {(container) => (
        <>
          <StageBackdropRows rows={['Lena Park · Admin', 'Tomás Ortega · Admin', 'Ama Mensah · Editor', 'Kai Nakamura · Viewer']} />
          <Dialog open modal={false}>
            <DialogContent container={container} initialFocus={false}>
              <DialogHeader>
                <DialogTitle>Remove Ama Mensah?</DialogTitle>
                <DialogDescription>She loses access to Parallax right away.</DialogDescription>
              </DialogHeader>
              <DialogBody>
                <p>Her 4 saved views move to you. You can invite her again later.</p>
              </DialogBody>
              <DialogFooter>
                <DialogClose render={<Button variant="secondary" />}>Cancel</DialogClose>
                <Button variant="destructive">Remove member</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}
    </GalleryStage>
  );
}

const platformFilters = [
  { value: 'web', label: 'Web', checked: true },
  { value: 'ios', label: 'iOS', checked: true },
  { value: 'android', label: 'Android', checked: false },
  { value: 'server', label: 'Server', checked: false },
];

/** Drawer as a bottom sheet, pinned open, with a group of checkboxes. */
export function DrawerStage() {
  return (
    <GalleryStage title="Drawer" description="A bottom sheet with filters, as on a phone." stageClassName="h-[26.5rem]">
      {(container) => (
        <>
          <StageBackdropRows rows={['Fernhill Books', 'Brightloop Fitness', 'Copperline Bank', 'Saltmarsh Coffee', 'Driftwood Travel']} />
          <Drawer open modal={false} swipeDirection="down">
            <DrawerContent container={container} initialFocus={false}>
              <DrawerHeader>
                <DrawerTitle>Filter projects</DrawerTitle>
                <DrawerDescription>Show projects on these platforms.</DrawerDescription>
              </DrawerHeader>
              <DrawerBody>
                <Field name="platform">
                  <CheckboxGroup
                    aria-label="Platform"
                    defaultValue={platformFilters.filter((filter) => filter.checked).map((filter) => filter.value)}
                    className="flex flex-col gap-3"
                  >
                    {platformFilters.map((filter) => (
                      <FieldItem key={filter.value}>
                        <Checkbox value={filter.value} />
                        <FieldLabel>{filter.label}</FieldLabel>
                      </FieldItem>
                    ))}
                  </CheckboxGroup>
                </Field>
              </DrawerBody>
              <DrawerFooter>
                <Button variant="secondary">Reset</Button>
                <Button variant="primary">Show 8 projects</Button>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
        </>
      )}
    </GalleryStage>
  );
}
