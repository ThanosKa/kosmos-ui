import type * as React from 'react';
import { cn } from '@/registry/kosmos/lib/cn';

type ShimmerProps = React.ComponentProps<'span'> & {
  /** Whether the light sweeps. Set it to false when the work is done and the text should settle. */
  active?: boolean;
};

/**
 * A soft light that sweeps across text, for a state that is still working ("Thinking", "Generating"). The text is real
 * text, so it reads and selects as usual; the sweep is a gradient clipped to the letters, so the text keeps its
 * contrast. Under reduced motion, in forced-colors mode and while `active` is false, the text is plain and still.
 */
function Shimmer({ active = true, className, ...props }: ShimmerProps) {
  return (
    <span
      data-slot="shimmer"
      data-active={active ? '' : undefined}
      className={cn(
        'text-muted-foreground',
        'motion-safe:data-active:animate-shimmer motion-safe:data-active:bg-linear-to-r motion-safe:data-active:from-muted-foreground motion-safe:data-active:from-40% motion-safe:data-active:via-foreground motion-safe:data-active:via-50% motion-safe:data-active:to-muted-foreground motion-safe:data-active:to-60% motion-safe:data-active:bg-[length:250%_100%] motion-safe:data-active:bg-clip-text motion-safe:data-active:text-transparent',
        'forced-colors:bg-none forced-colors:text-[CanvasText]',
        className,
      )}
      {...props}
    />
  );
}

export { Shimmer, type ShimmerProps };
