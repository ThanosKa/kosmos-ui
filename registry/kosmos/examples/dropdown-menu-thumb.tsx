'use client';

import { ChevronDown, Copy, Pencil, Share2, Trash2 } from 'lucide-react';
import { ThumbStage } from '@/components/preview/overlay-stage';
import { Button } from '@/registry/kosmos/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/registry/kosmos/ui/dropdown-menu';
import { Kbd } from '@/registry/kosmos/ui/kbd';

/** The components index thumbnail: the docs demo with its menu open. */
export default function DropdownMenuThumb() {
  return (
    <ThumbStage className="flex h-60 max-w-md justify-center">
      {(container) => (
        <DropdownMenu open modal={false}>
          <DropdownMenuTrigger render={<Button variant="secondary" />}>
            Actions
            <ChevronDown data-icon="inline-end" />
          </DropdownMenuTrigger>
          <DropdownMenuContent container={container}>
            <DropdownMenuItem className="bg-accent">
              <Pencil />
              Rename
              <DropdownMenuShortcut>
                <Kbd>⌘</Kbd>
                <Kbd>R</Kbd>
              </DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Copy />
              Duplicate
              <DropdownMenuShortcut>
                <Kbd>⌘</Kbd>
                <Kbd>D</Kbd>
              </DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Share2 />
              Share
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive">
              <Trash2 />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </ThumbStage>
  );
}
