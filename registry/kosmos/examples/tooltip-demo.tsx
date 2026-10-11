import { Bold, Italic, Underline } from 'lucide-react';
import { Button } from '@/registry/kosmos/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/registry/kosmos/ui/tooltip';

const actions = [
  { label: 'Bold', shortcut: '⌘B', keys: 'Meta+B', icon: Bold },
  { label: 'Italic', shortcut: '⌘I', keys: 'Meta+I', icon: Italic },
  { label: 'Underline', shortcut: '⌘U', keys: 'Meta+U', icon: Underline },
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
            <TooltipContent>
              {label} <kbd className="ms-1 font-sans text-muted-foreground">{shortcut}</kbd>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
}
