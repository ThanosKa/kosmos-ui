'use client';

import { Radio as RadioPrimitive } from '@base-ui/react/radio';
import { RadioGroup as RadioGroupPrimitive } from '@base-ui/react/radio-group';
import { cva } from 'class-variance-authority';
import * as React from 'react';
import { cn } from '@/registry/kosmos/lib/cn';

type SegmentedControlSize = 'sm' | 'md';

const SegmentedControlContext = React.createContext<SegmentedControlSize>('md');

type SegmentedControlProps = Omit<RadioGroupPrimitive.Props<string>, 'value' | 'defaultValue' | 'onValueChange'> & {
  /** The selected item. Use with `onValueChange`. */
  value?: string;
  /** The item selected at first, when the control keeps its own state. */
  defaultValue?: string;
  /** Called with the newly selected item. */
  onValueChange?: (value: string, eventDetails: RadioGroupPrimitive.ChangeEventDetails) => void;
  /** `md` matches a 30px Button, `sm` a 24px one. */
  size?: SegmentedControlSize;
};

/**
 * Picks one of two to five options, like a view mode or a time range. A radio group underneath: once an
 * item is selected one always stays selected, Tab lands on it, and the arrow keys move the selection.
 * Pass `value` or `defaultValue` so it starts with a selection, and `name` to submit it with a form.
 */
function SegmentedControl({ className, size = 'md', ...props }: SegmentedControlProps) {
  return (
    <SegmentedControlContext.Provider value={size}>
      <RadioGroupPrimitive<string>
        data-slot="segmented-control"
        data-size={size}
        className={cn(
          'inline-flex w-fit max-w-full items-stretch rounded-lg border border-transparent bg-muted p-0.5 shadow-inset',
          className,
        )}
        {...props}
      />
    </SegmentedControlContext.Provider>
  );
}

const segmentedControlItemVariants = cva(
  [
    // Labels stay on one line until the control reaches the width of its container, then wrap.
    'relative isolate inline-flex min-w-0 grow cursor-default items-center justify-center gap-1.5 rounded-md border border-transparent text-center font-medium text-balance text-muted-foreground [-webkit-tap-highlight-color:transparent]',
    'transition-[color] hover:not-data-disabled:text-foreground data-checked:text-foreground',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
    'data-disabled:opacity-50',
    // The raised surface behind the selected item.
    'before:absolute before:-inset-px before:-z-10 before:rounded-[inherit] before:border before:border-transparent before:bg-secondary before:opacity-0 before:shadow-control',
    'before:transition-opacity data-checked:before:opacity-100',
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5",
    // An item with only an icon and an `aria-label` is square.
    '[&[aria-label]]:shrink-0 [&[aria-label]]:px-0',
  ],
  {
    variants: {
      size: {
        sm: "min-h-5 px-2 text-small [&_svg:not([class*='size-'])]:size-3.5 [&[aria-label]]:w-6",
        md: 'min-h-6.5 px-2.5 py-0.5 text-body [&[aria-label]]:w-7',
      },
    },
    defaultVariants: { size: 'md' },
  },
);

type SegmentedControlItemProps = Omit<RadioPrimitive.Root.Props<string>, 'value'> & {
  /** The value the control reports when this item is selected. */
  value: string;
};

/**
 * One option. Text, an icon (`data-icon="inline-start"`), or an icon alone with an `aria-label`,
 * which makes the item square. The selected item lifts onto a raised surface that cross-fades in,
 * so nothing moves.
 */
function SegmentedControlItem({ className, ...props }: SegmentedControlItemProps) {
  const size = React.useContext(SegmentedControlContext);
  return (
    <RadioPrimitive.Root
      data-slot="segmented-control-item"
      className={cn(segmentedControlItemVariants({ size }), className)}
      {...props}
    />
  );
}

export { SegmentedControl, SegmentedControlItem, type SegmentedControlProps, type SegmentedControlItemProps };
