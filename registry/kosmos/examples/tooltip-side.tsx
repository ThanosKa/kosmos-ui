import { Button } from '@/registry/kosmos/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/registry/kosmos/ui/tooltip';

export default function TooltipSide() {
  return (
    <TooltipProvider>
      <div className="flex flex-wrap items-center gap-2">
        {(['top', 'right', 'bottom', 'left'] as const).map((side) => (
          <Tooltip key={side}>
            <TooltipTrigger render={<Button variant="secondary" />}>{side}</TooltipTrigger>
            <TooltipContent side={side}>Copy link</TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
}
