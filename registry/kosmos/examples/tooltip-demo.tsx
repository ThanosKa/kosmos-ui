import { Bold, Italic, Underline } from 'lucide-react';
import { Button } from '@/registry/kosmos/ui/button';
import { Kbd, KbdGroup } from '@/registry/kosmos/ui/kbd';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/registry/kosmos/ui/tooltip';

const actions = [
  { label: 'Bold', shortcut: ['⌘', 'B'], keys: 'Meta+B', icon: Bold },
  { label: 'Italic', shortcut: ['⌘', 'I'], keys: 'Meta+I', icon: Italic },
  { label: 'Underline', shortcut: ['⌘', 'U'], keys: 'Meta+U', icon: Underline },
];

export default function TooltipDemo() {
  return (
    <TooltipProvider>
      <div className="flex items-center gap-1">
        {actions.map(({ label, shortcut, keys, icon: Icon }) => (
          <Tooltip key={label}>
            <TooltipTrigger render={<Button variant="ghost" size="icon" aria-label={label} aria-keyshortcuts={keys} />}>
              <Icon />
            </TooltipTrigger>
            <TooltipContent className="flex items-center gap-2 pe-1">
              {label}
              <KbdGroup>
                {shortcut.map((key) => (
                  <Kbd key={key}>{key}</Kbd>
                ))}
              </KbdGroup>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
}
