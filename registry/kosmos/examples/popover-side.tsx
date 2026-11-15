import { Button } from '@/registry/kosmos/ui/button';
import { Popover, PopoverContent, PopoverDescription, PopoverTrigger } from '@/registry/kosmos/ui/popover';

const sides = ['top', 'right', 'bottom', 'left'] as const;

export default function PopoverSide() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      {sides.map((side) => (
        <Popover key={side}>
          <PopoverTrigger render={<Button variant="secondary" className="capitalize" />}>{side}</PopoverTrigger>
          <PopoverContent side={side} className="w-56">
            <PopoverDescription>Opens on the {side}, or flips when there isn&apos;t room.</PopoverDescription>
          </PopoverContent>
        </Popover>
      ))}
    </div>
  );
}
