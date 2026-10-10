import { Button } from '@/registry/kosmos/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/registry/kosmos/ui/tooltip';

export default function TooltipDisabled() {
  return (
    <Tooltip>
      <TooltipTrigger
        render={<Button variant="primary" disabled focusableWhenDisabled aria-describedby="publish-hint" />}
      >
        Publish
      </TooltipTrigger>
      <TooltipContent>Add a title to publish</TooltipContent>
      <span id="publish-hint" className="sr-only">
        Add a title to publish
      </span>
    </Tooltip>
  );
}
