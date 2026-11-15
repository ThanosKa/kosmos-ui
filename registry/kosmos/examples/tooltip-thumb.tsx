'use client';

import { Bold, Italic, Underline } from 'lucide-react';
import { Button } from '@/registry/kosmos/ui/button';
import { Kbd, KbdGroup } from '@/registry/kosmos/ui/kbd';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/registry/kosmos/ui/tooltip';

/** The components index thumbnail: the docs demo's toolbar with one tooltip open. */
export default function TooltipThumb() {
  return (
    <div className="flex items-center gap-1 pt-12">
      <Button variant="ghost" size="icon" aria-label="Bold">
        <Bold />
      </Button>
      <Tooltip open>
        <TooltipTrigger render={<Button variant="ghost" size="icon" aria-label="Italic" aria-keyshortcuts="Meta+I" />}>
          <Italic />
        </TooltipTrigger>
        <TooltipContent className="flex items-center gap-2 pe-1">
          Italic
          <KbdGroup>
            <Kbd>⌘</Kbd>
            <Kbd>I</Kbd>
          </KbdGroup>
        </TooltipContent>
      </Tooltip>
      <Button variant="ghost" size="icon" aria-label="Underline">
        <Underline />
      </Button>
    </div>
  );
}
