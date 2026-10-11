import { Archive, Ellipsis, ExternalLink, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/registry/kosmos/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuLinkItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/registry/kosmos/ui/dropdown-menu';

export default function DropdownMenuIconTrigger() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="ghost" size="icon" aria-label="More actions" />}>
        <Ellipsis />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Q3 Roadmap</DropdownMenuLabel>
          <DropdownMenuItem>
            <Pencil />
            Rename
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Archive />
            Archive
          </DropdownMenuItem>
          <DropdownMenuLinkItem href="#" target="_blank" rel="noreferrer">
            <ExternalLink />
            Open in new tab
          </DropdownMenuLinkItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive">
          <Trash2 />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
