import { Bold, Italic, Settings, Strikethrough, Underline } from 'lucide-react';
import { PreviewSection, PreviewStack } from '@/components/preview/preview-section';
import { Button } from '@/registry/kosmos/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/registry/kosmos/ui/tooltip';

const sides = ['top', 'right', 'bottom', 'left'] as const;

export default function TooltipPreview() {
  return (
    <PreviewStack>
      <PreviewSection title="Open, on each side">
        <div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-4">
          {sides.map((side) => (
            <div key={side} className="flex h-24 items-center justify-center">
              <Tooltip open>
                <TooltipTrigger render={<Button variant="secondary" />}>{side}</TooltipTrigger>
                <TooltipContent side={side}>Copy link</TooltipContent>
              </Tooltip>
            </div>
          ))}
        </div>
      </PreviewSection>

      <PreviewSection title="Open: shortcut, long text, disabled trigger">
        <div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-3">
          <div className="flex h-24 items-end justify-center">
            <Tooltip open>
              <TooltipTrigger render={<Button variant="ghost" size="icon" aria-label="Bold" aria-keyshortcuts="Meta+B" />}>
                <Bold />
              </TooltipTrigger>
              <TooltipContent>
                Bold <kbd className="ms-1 font-sans text-muted-foreground">⌘B</kbd>
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="flex h-36 items-start justify-center">
            <Tooltip open>
              <TooltipTrigger render={<Button variant="secondary" />}>Sync</TooltipTrigger>
              <TooltipContent side="bottom">
                Pulls the latest invoices from your accounting tool. Runs on its own every hour.
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="flex h-24 items-end justify-center">
            <Tooltip open>
              <TooltipTrigger render={<Button variant="primary" disabled focusableWhenDisabled />}>
                Publish
              </TooltipTrigger>
              <TooltipContent>Add a title to publish</TooltipContent>
            </Tooltip>
          </div>
        </div>
      </PreviewSection>

      <PreviewSection title="Closed: hover or focus a button">
        <TooltipProvider>
          <div className="flex items-center gap-1">
            {[
              { label: 'Bold', icon: Bold },
              { label: 'Italic', icon: Italic },
              { label: 'Underline', icon: Underline },
              { label: 'Strikethrough', icon: Strikethrough },
            ].map(({ label, icon: Icon }) => (
              <Tooltip key={label}>
                <TooltipTrigger render={<Button variant="ghost" size="icon" aria-label={label} />}>
                  <Icon />
                </TooltipTrigger>
                <TooltipContent>{label}</TooltipContent>
              </Tooltip>
            ))}
            <Tooltip>
              <TooltipTrigger render={<Button variant="secondary" size="icon" aria-label="Settings" />}>
                <Settings />
              </TooltipTrigger>
              <TooltipContent side="right">Settings</TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      </PreviewSection>
    </PreviewStack>
  );
}
