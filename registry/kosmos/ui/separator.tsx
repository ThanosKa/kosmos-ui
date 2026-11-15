import { Separator as SeparatorPrimitive } from '@base-ui/react/separator';
import { cn } from '@/registry/kosmos/lib/cn';

/** A 1px line between groups of content. A vertical one stretches to the height of its flex row. */
function Separator({ className, orientation = 'horizontal', ...props }: SeparatorPrimitive.Props) {
  return (
    <SeparatorPrimitive
      data-slot="separator"
      orientation={orientation}
      className={cn(
        'shrink-0 border-border',
        'data-[orientation=horizontal]:w-full data-[orientation=horizontal]:border-t',
        'data-[orientation=vertical]:self-stretch data-[orientation=vertical]:border-s',
        className,
      )}
      {...props}
    />
  );
}

export { Separator };
