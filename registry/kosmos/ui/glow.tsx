import { cva, type VariantProps } from 'class-variance-authority';
import type * as React from 'react';
import { cn } from '@/registry/kosmos/lib/cn';

const glowPosition = cva('absolute inset-x-0 h-0', {
  variants: {
    position: {
      top: 'top-0',
      bottom: 'bottom-0',
      center: 'top-1/2',
    },
  },
  defaultVariants: { position: 'top' },
});

type GlowProps = React.ComponentProps<'div'> & VariantProps<typeof glowPosition>;

/**
 * A soft glow of the accent colour (ink when the preset sets no accent) behind a section, for a hero or a call to action.
 * It fills the nearest positioned parent, clips itself, sits behind the content and is hidden from assistive technology.
 */
function Glow({ position, className, ...props }: GlowProps) {
  const centered = position === 'center';
  return (
    <div data-slot="glow" aria-hidden="true" className={cn('pointer-events-none absolute inset-0 -z-10 overflow-hidden', className)} {...props}>
      <div className={glowPosition({ position })}>
        <div
          className={cn(
            'absolute left-1/2 h-64 w-3/5 -translate-x-1/2 scale-[2] rounded-[50%] bg-radial from-accent-text/10 from-10% to-transparent to-60% sm:h-128 dark:from-accent-text/9',
            centered && '-translate-y-1/2',
          )}
        />
        <div
          className={cn(
            'absolute left-1/2 h-32 w-2/5 -translate-x-1/2 scale-150 rounded-[50%] bg-radial from-accent-text/10 from-10% to-transparent to-60% sm:h-64 dark:from-accent-text/12',
            centered && '-translate-y-1/2',
          )}
        />
      </div>
    </div>
  );
}

export { Glow, type GlowProps };
