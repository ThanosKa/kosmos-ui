'use client';

import { NumberField as NumberFieldPrimitive } from '@base-ui/react/number-field';
import { Minus, Plus } from 'lucide-react';
import { Button } from '@/registry/kosmos/ui/button';
import { cn } from '@/registry/kosmos/lib/cn';

type NumberFieldProps = Omit<NumberFieldPrimitive.Root.Props, 'className' | 'children'> &
  Pick<NumberFieldPrimitive.Input.Props, 'placeholder' | 'aria-label' | 'aria-labelledby'> & {
    /** Classes for the field itself: its width (`w-40` by default) or a toolbar height (`h-7.5`). */
    className?: string;
  };

// Pressed, a stepper keeps its hover fill, so a touch with no hover still shows, and quick taps never zoom the page. Read-only, it dims like a disabled one.
const stepper = [
  'size-auto aspect-square h-full touch-manipulation rounded-md text-muted-foreground transition-[background-color,color]',
  'hover:not-data-disabled:text-foreground active:not-data-disabled:bg-accent active:not-data-disabled:text-foreground',
  'data-readonly:pointer-events-none data-readonly:opacity-50',
].join(' ');

/**
 * A number with a stepper: a minus and a plus button beside a text input. The arrow keys step by
 * `step`, Shift by `largeStep`, and Home and End jump to `min` and `max`; a button disables at
 * its end of the range. `format` takes `Intl.NumberFormat` options for currency, percent or units.
 * Inside a `Field` it takes its label from the field; on its own it needs an `aria-label`.
 */
function NumberField({ className, placeholder, 'aria-label': ariaLabel, 'aria-labelledby': ariaLabelledBy, ...props }: NumberFieldProps) {
  // Only names the app passes reach the input: an `undefined` would replace the label id the Field gives it.
  const inputNames = {
    ...(ariaLabel !== undefined && { 'aria-label': ariaLabel }),
    ...(ariaLabelledBy !== undefined && { 'aria-labelledby': ariaLabelledBy }),
  };
  return (
    <NumberFieldPrimitive.Root data-slot="number-field" className="flex min-w-0" {...props}>
      <NumberFieldPrimitive.Group
        data-slot="number-field-group"
        className={cn(
          // The surface of Input, with the stepper buttons inset like the items of a segmented control.
          'flex h-8.5 w-40 min-w-0 items-stretch rounded-lg border border-transparent bg-secondary p-0.5 text-foreground shadow-field',
          'transition-[box-shadow]',
          // The field lights its edge while the input inside it has focus, as Input does. The transparent outline paints only in forced-colors mode.
          'has-focus-visible:outline-1 has-focus-visible:outline-offset-0 has-focus-visible:outline-transparent has-focus-visible:ring-offset-1 has-focus-visible:ring-offset-ring has-focus-visible:ring-3 has-focus-visible:ring-ring/20',
          'data-invalid:ring-1 data-invalid:ring-destructive',
          'data-invalid:has-focus-visible:ring-offset-destructive data-invalid:has-focus-visible:ring-3 data-invalid:has-focus-visible:ring-destructive/20',
          'data-disabled:cursor-not-allowed data-disabled:opacity-50',
          className,
        )}
      >
        <NumberFieldPrimitive.Decrement
          data-slot="number-field-decrement"
          render={<Button variant="item" size="icon-sm" className={stepper} />}
        >
          <Minus aria-hidden className="size-3.5" />
        </NumberFieldPrimitive.Decrement>
        <NumberFieldPrimitive.Input
          data-slot="number-field-input"
          placeholder={placeholder}
          {...inputNames}
          className={cn(
            'w-full min-w-0 flex-1 bg-transparent px-1 text-center text-base text-foreground tabular-nums outline-none sm:text-body',
            'placeholder:text-muted-foreground',
            'disabled:cursor-not-allowed',
          )}
        />
        <NumberFieldPrimitive.Increment
          data-slot="number-field-increment"
          render={<Button variant="item" size="icon-sm" className={stepper} />}
        >
          <Plus aria-hidden className="size-3.5" />
        </NumberFieldPrimitive.Increment>
      </NumberFieldPrimitive.Group>
    </NumberFieldPrimitive.Root>
  );
}

export { NumberField, type NumberFieldProps };
