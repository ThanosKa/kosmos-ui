import { Info } from 'lucide-react';
import { Button } from '@/registry/kosmos/ui/button';
import { Popover, PopoverContent, PopoverDescription, PopoverTrigger } from '@/registry/kosmos/ui/popover';

export default function PopoverHover() {
  return (
    <div className="flex items-center gap-1">
      <span className="text-body">Active users</span>
      <Popover>
        <PopoverTrigger
          openOnHover
          delay={200}
          render={<Button variant="ghost" size="icon-sm" aria-label="About active users" />}
        >
          <Info />
        </PopoverTrigger>
        <PopoverContent side="right" align="start" className="w-56">
          <PopoverDescription>
            Everyone who opened the app at least once in the last 28 days.
          </PopoverDescription>
        </PopoverContent>
      </Popover>
    </div>
  );
}
