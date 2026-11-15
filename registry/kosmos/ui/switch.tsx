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
        'group/switch relative inline-flex h-4.5 w-8 shrink-0 items-center rounded-full border border-transparent bg-muted p-px shadow-inset [-webkit-tap-highlight-color:transparent]',
        // A 26px tall hit area around the 18px track.
        'after:absolute after:-inset-1',
        'transition-[background-color,box-shadow]',
        'hover:not-data-disabled:bg-input data-checked:bg-primary hover:not-data-disabled:data-checked:bg-primary/90',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
        'data-invalid:ring-1 data-invalid:ring-destructive aria-invalid:ring-1 aria-invalid:ring-destructive',
        'data-invalid:data-checked:ring-2 aria-invalid:data-checked:ring-2',
        'data-disabled:cursor-not-allowed data-disabled:opacity-50',
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          thumbSurface,
          'data-checked:bg-primary-foreground',
          'motion-safe:transition-[translate] motion-safe:duration-slow motion-safe:ease-smooth-in-out',
          'data-checked:translate-x-3.5 rtl:data-checked:-translate-x-3.5',
          'motion-reduce:invisible',
        )}
      />
      {/* Under reduced motion the thumb does not slide: one still thumb at each end cross-fades instead. */}
      <span
        aria-hidden
        className={cn(thumbSurface, stillThumb, 'start-px opacity-100 group-data-checked/switch:opacity-0')}
      />
      <span
        aria-hidden
        className={cn(
          thumbSurface,
          stillThumb,
          'end-px bg-primary-foreground opacity-0 group-data-checked/switch:opacity-100',
        )}
      />
    </SwitchPrimitive.Root>
  );
}

// Off, the thumb is `thumb` (near-white in both themes) on the muted track. On, it takes `primary-foreground`,
// which contrasts with the `primary` track in each theme (light on ink, ink on the light dark-mode primary).
const thumbSurface = 'pointer-events-none block size-3.5 rounded-full border border-transparent bg-thumb shadow-thumb';
const stillThumb = 'absolute top-px hidden transition-[opacity] motion-reduce:block';

export { Switch, type SwitchProps };
