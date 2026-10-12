'use client';

import {
  Archive,
  ChevronDown,
  Copy,
  Ellipsis,
  ExternalLink,
  LogOut,
  Pencil,
  Settings,
  Share2,
  Trash2,
  User,
  UserPlus,
} from 'lucide-react';
import { useState } from 'react';
import { OverlayStage, OverlayStageGrid } from '@/components/preview/overlay-stage';
import { PreviewSection, PreviewStack } from '@/components/preview/preview-section';
import { ScrollToMiddle } from '@/components/preview/scroll-to-middle';
import { Button } from '@/registry/kosmos/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuLinkItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/registry/kosmos/ui/dropdown-menu';
import { Kbd } from '@/registry/kosmos/ui/kbd';

const stageClass = 'h-[24rem]';

const projects = [
  'Q3 Roadmap',
  'Website refresh',
  'Mobile app',
  'Billing migration',
  'Onboarding emails',
  'Design system',
  'Help center',
  'Data warehouse',
  'Security review',
  'Hiring plan',
  'Partner portal',
  'Year-end report',
];

function MoveToMenu({ container, scrolled }: { container: HTMLElement; scrolled?: boolean }) {
  return (
    <DropdownMenu open modal={false}>
      <DropdownMenuTrigger render={<Button variant="secondary" />}>
        Move to
        <ChevronDown data-icon="inline-end" />
      </DropdownMenuTrigger>
      <DropdownMenuContent container={container} className="max-h-60">
        {scrolled ? <ScrollToMiddle /> : null}
        <DropdownMenuGroup>
          <DropdownMenuLabel>Projects</DropdownMenuLabel>
          {projects.map((project) => (
            <DropdownMenuItem key={project}>{project}</DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function DropdownMenuPreview() {
  return (
    <PreviewStack>
      <PreviewSection title="Open">
        <OverlayStageGrid>
          <OverlayStage label="items: icon, shortcut, highlighted, disabled, destructive" className={stageClass}>
            {(container) => (
              <DropdownMenu open modal={false}>
                <DropdownMenuTrigger render={<Button variant="secondary" />}>
                  Actions
                  <ChevronDown data-icon="inline-end" />
                </DropdownMenuTrigger>
                <DropdownMenuContent container={container}>
                  {/* Pinned: a real item highlights on hover or arrow keys. */}
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
                  <DropdownMenuItem disabled>
                    <Share2 />
                    Share
                    <DropdownMenuShortcut><Kbd>⌘</Kbd><Kbd>S</Kbd></DropdownMenuShortcut>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Archive />
                    Archive
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem variant="destructive">
                    <Trash2 />
                    Delete
                    <DropdownMenuShortcut><Kbd>⌘</Kbd><Kbd>⌫</Kbd></DropdownMenuShortcut>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </OverlayStage>

          <OverlayStage label="checkbox and radio items, group labels" className={stageClass}>
            {(container) => <CheckAndRadioMenu container={container} />}
          </OverlayStage>

          <OverlayStage label="submenu open, link item" className={stageClass}>
            {(container) => (
              <DropdownMenu open modal={false}>
                <DropdownMenuTrigger render={<Button variant="ghost" size="icon" aria-label="More actions" />}>
                  <Ellipsis />
                </DropdownMenuTrigger>
                <DropdownMenuContent container={container}>
                  <DropdownMenuGroup>
                    <DropdownMenuLabel>Q3 Roadmap</DropdownMenuLabel>
                    <DropdownMenuItem>
                      <Pencil />
                      Rename
                    </DropdownMenuItem>
                    <DropdownMenuSub open>
                      <DropdownMenuSubTrigger>
                        <UserPlus />
                        Invite
                      </DropdownMenuSubTrigger>
                      <DropdownMenuSubContent container={container}>
                        <DropdownMenuItem>Ana Lopez</DropdownMenuItem>
                        <DropdownMenuItem>Ben Carter</DropdownMenuItem>
                        <DropdownMenuItem>Chen Wei</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>Invite by email…</DropdownMenuItem>
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>
                    <DropdownMenuLinkItem href="#docs" onClick={(event) => event.preventDefault()}>
                      <ExternalLink />
                      Open in new tab
                    </DropdownMenuLinkItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </OverlayStage>

          <OverlayStage label="long text, no room below (flips up), end aligned" className={stageClass}>
            {(container) => (
              <div className="flex h-full items-end justify-end">
                <DropdownMenu open modal={false}>
                  <DropdownMenuTrigger render={<Button variant="secondary" />}>
                    <User data-icon="inline-start" />
                    Ana Lopez
                  </DropdownMenuTrigger>
                  <DropdownMenuContent container={container} align="end" className="w-56">
                    <DropdownMenuGroup>
                      <DropdownMenuLabel className="truncate">ana.lopez@northwind-logistics.example.com</DropdownMenuLabel>
                      <DropdownMenuItem>
                        <Settings />
                        Workspace settings and billing for Northwind Logistics
                      </DropdownMenuItem>
                      <DropdownMenuItem inset>Keyboard shortcuts</DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <LogOut />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </OverlayStage>

          <OverlayStage label="more items than fit, at the top" className={stageClass}>
            {(container) => <MoveToMenu container={container} />}
          </OverlayStage>

          <OverlayStage label="more items than fit, scrolled halfway" className={stageClass}>
            {(container) => <MoveToMenu container={container} scrolled />}
          </OverlayStage>
        </OverlayStageGrid>
      </PreviewSection>

      <PreviewSection title="Live (with trigger)">
        <div className="flex flex-wrap items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="secondary" />}>
              Actions
              <ChevronDown data-icon="inline-end" />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>
                <Pencil />
                Rename
                <DropdownMenuShortcut><Kbd>⌘</Kbd><Kbd>R</Kbd></DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Copy />
                Duplicate
                <DropdownMenuShortcut><Kbd>⌘</Kbd><Kbd>D</Kbd></DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuItem disabled>
                <Share2 />
                Share
              </DropdownMenuItem>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <UserPlus />
                  Invite
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuItem>Ana Lopez</DropdownMenuItem>
                  <DropdownMenuItem>Ben Carter</DropdownMenuItem>
                  <DropdownMenuItem>Chen Wei</DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive">
                <Trash2 />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <CheckAndRadioMenu />
        </div>
      </PreviewSection>
    </PreviewStack>
  );
}

function CheckAndRadioMenu({ container }: { container?: HTMLElement }) {
  const [showCompleted, setShowCompleted] = useState(true);
  const [showArchived, setShowArchived] = useState(false);
  const [sort, setSort] = useState('due');
  const pinned = container !== undefined;
  return (
    <DropdownMenu open={pinned ? true : undefined} modal={pinned ? false : undefined}>
      <DropdownMenuTrigger render={<Button variant="secondary" />}>
        View
        <ChevronDown data-icon="inline-end" />
      </DropdownMenuTrigger>
      <DropdownMenuContent container={container}>
        <DropdownMenuGroup>
          <DropdownMenuLabel>Show</DropdownMenuLabel>
          <DropdownMenuCheckboxItem checked={showCompleted} onCheckedChange={setShowCompleted}>
            Completed tasks
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem checked={showArchived} onCheckedChange={setShowArchived}>
            Archived tasks
          </DropdownMenuCheckboxItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup value={sort} onValueChange={setSort}>
          <DropdownMenuLabel>Sort by</DropdownMenuLabel>
          <DropdownMenuRadioItem value="due">Due date</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="priority">Priority</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="assignee">Assignee</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
