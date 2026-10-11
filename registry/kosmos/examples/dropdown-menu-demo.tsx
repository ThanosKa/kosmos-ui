import { ChevronDown, Copy, Pencil, Share2, Trash2, UserPlus } from 'lucide-react';
import { Button } from '@/registry/kosmos/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/registry/kosmos/ui/dropdown-menu';

export default function DropdownMenuDemo() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="secondary" />}>
        Actions
        <ChevronDown data-icon="inline-end" />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>
          <Pencil />
          Rename
          <DropdownMenuShortcut>⌘R</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Copy />
          Duplicate
          <DropdownMenuShortcut>⌘D</DropdownMenuShortcut>
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
  );
}
