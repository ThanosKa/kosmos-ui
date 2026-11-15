'use client';

import { Checkbox as CheckboxPrimitive } from '@base-ui/react/checkbox';
import { Check, Minus } from 'lucide-react';
import { cn } from '@/registry/kosmos/lib/cn';

type CheckboxProps = Omit<CheckboxPrimitive.Root.Props, 'className' | 'children'> & { className?: string };

/**
 * A box that ticks on and off, with a mixed state (`indeterminate`) for a parent of a partly
 * ticked list. Inside a horizontal `Field` it takes its label from the FieldLabel beside it;
 * on its own it needs an `aria-label`.
 */
function Checkbox({ className, ...props }: CheckboxProps) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        'relative inline-flex size-4 shrink-0 items-center justify-center rounded-sm border border-transparent bg-secondary text-primary-foreground shadow-control [-webkit-tap-highlight-color:transparent]',
        // A 24px hit area around the 16px box, for touch and for a box with no label beside it.
        'after:absolute after:-inset-1',
        'transition-[background-color,box-shadow]',
        'hover:not-data-disabled:bg-muted',
        'data-checked:bg-primary data-checked:shadow-primary data-indeterminate:bg-primary data-indeterminate:shadow-primary',
        'hover:not-data-disabled:data-checked:bg-primary/90 hover:not-data-disabled:data-indeterminate:bg-primary/90',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
        // Invalid adds a destructive ring over the control ring, as on Input; 2px on the ink fill of a ticked box, where 1px disappears.
        'data-invalid:ring-1 data-invalid:ring-destructive aria-invalid:ring-1 aria-invalid:ring-destructive',
        'data-invalid:data-checked:ring-2 data-invalid:data-indeterminate:ring-2 aria-invalid:data-checked:ring-2 aria-invalid:data-indeterminate:ring-2',
        'data-disabled:cursor-not-allowed data-disabled:opacity-50',
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className={cn(
          'flex items-center justify-center',
          // The mark fades in and out with the fill; it grows from half size only when motion is allowed.
          'transition-[opacity,scale] duration-fast',
          'data-starting-style:opacity-0 data-ending-style:opacity-0',
          'motion-safe:data-starting-style:scale-50 motion-safe:data-ending-style:scale-50',
        )}
        render={(indicatorProps, state) => (
          <span {...indicatorProps}>
            {state.indeterminate ? (
              <Minus aria-hidden strokeWidth={3} className="size-3" />
            ) : (
              <Check aria-hidden strokeWidth={3} className="size-3" />
            )}
          </span>
        )}
      />
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox, type CheckboxProps };
