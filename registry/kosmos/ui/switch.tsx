'use client';

import { Switch as SwitchPrimitive } from '@base-ui/react/switch';
import { cn } from '@/registry/kosmos/lib/cn';

type SwitchProps = Omit<SwitchPrimitive.Root.Props, 'className' | 'children'> & { className?: string };

/**
 * An on/off control for a setting that applies at once. Inside a horizontal `Field` it takes
 * its label from the FieldLabel beside it; on its own it needs an `aria-label`.
 */
function Switch({ className, ...props }: SwitchProps) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        'relative inline-flex h-4.5 w-8 shrink-0 items-center rounded-full border border-transparent bg-muted p-px shadow-inset [-webkit-tap-highlight-color:transparent]',
        // A 26px tall hit area around the 18px track.
        'after:absolute after:-inset-1',
        'transition-[background-color,box-shadow]',
        'data-checked:bg-primary',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
        'data-invalid:ring-1 data-invalid:ring-destructive aria-invalid:ring-1 aria-invalid:ring-destructive',
        'data-disabled:cursor-not-allowed data-disabled:opacity-50',
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          // `primary-foreground` is near-white in both themes: it reads on the indigo track and on the muted one.
          'pointer-events-none block size-3.5 rounded-full border border-transparent bg-primary-foreground shadow-thumb',
          // The thumb slides only when motion is allowed; under reduced motion it moves at once while the track color fades.
          'motion-safe:transition-[translate] motion-safe:duration-slow motion-safe:ease-smooth-in-out',
          'data-checked:translate-x-3.5 rtl:data-checked:-translate-x-3.5',
        )}
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch, type SwitchProps };
