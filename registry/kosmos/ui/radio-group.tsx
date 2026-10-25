'use client';

import { Radio as RadioPrimitive } from '@base-ui/react/radio';
import { RadioGroup as RadioGroupPrimitive } from '@base-ui/react/radio-group';
import * as React from 'react';
import { cn } from '@/registry/kosmos/lib/cn';

type RadioGroupProps = Omit<RadioGroupPrimitive.Props<string>, 'className' | 'value' | 'defaultValue' | 'onValueChange'> & {
  className?: string;
  /** The selected option. Use with `onValueChange`. */
  value?: string;
  /** The option selected at first, when the group keeps its own state. */
  defaultValue?: string;
  /** Called with the newly selected option. */
  onValueChange?: (value: string, eventDetails: RadioGroupPrimitive.ChangeEventDetails) => void;
};

/**
 * Picks one option from a short list, as radios beside their labels or as radio cards. Tab lands
 * on the selected option and the arrow keys move the selection. Inside a `Field` it takes its
 * name from the FieldLabel above it; on its own it needs an `aria-label` or `aria-labelledby`.
 */
function RadioGroup({ className, ...props }: RadioGroupProps) {
  return (
    <RadioGroupPrimitive<string>
      data-slot="radio-group"
      className={cn('grid min-w-0 gap-3 data-disabled:cursor-not-allowed', className)}
      {...props}
    />
  );
}

// The 16px circle, shared by the radio and the mark in a radio card: the checkbox surface, round.
const circle = [
  'relative inline-flex size-4 shrink-0 items-center justify-center rounded-full border border-transparent bg-secondary text-primary-foreground shadow-control',
  'transition-[background-color,box-shadow]',
];

/** The dot in a selected radio. It fades in with the fill and grows from half size only when motion is allowed. */
function RadioDot() {
  return (
    <RadioPrimitive.Indicator
      data-slot="radio-indicator"
      className={cn(
        'flex items-center justify-center',
        'transition-[opacity,scale] duration-fast',
        'data-starting-style:opacity-0 data-ending-style:opacity-0',
        'motion-safe:data-starting-style:scale-50 motion-safe:data-ending-style:scale-50',
      )}
    >
      {/* An SVG fill in `currentColor`, so forced-colors mode, which drops backgrounds, still draws the dot. */}
      <svg aria-hidden viewBox="0 0 6 6" className="size-1.5 fill-current">
        <circle cx="3" cy="3" r="3" />
      </svg>
    </RadioPrimitive.Indicator>
  );
}

type RadioGroupItemProps = Omit<RadioPrimitive.Root.Props<string>, 'className' | 'children'> & { className?: string };

/**
 * One option of a RadioGroup. Put it first in a FieldItem with its FieldLabel beside it; on its
 * own it needs an `aria-label`.
 */
function RadioGroupItem({ className, ...props }: RadioGroupItemProps) {
  return (
    <RadioPrimitive.Root<string>
      data-slot="radio-group-item"
      className={cn(
        circle,
        '[-webkit-tap-highlight-color:transparent]',
        // A 24px hit area around the 16px circle, for touch and for a radio with no label beside it.
        'after:absolute after:-inset-1',
        'hover:not-data-disabled:not-data-readonly:bg-muted',
        'data-checked:bg-primary data-checked:shadow-primary hover:not-data-disabled:not-data-readonly:data-checked:bg-primary/90',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
        // Invalid adds a destructive ring over the control ring, as on Checkbox; 2px on the ink fill of a selected radio.
        'data-invalid:ring-1 data-invalid:ring-destructive aria-invalid:ring-1 aria-invalid:ring-destructive',
        'data-invalid:data-checked:ring-2 aria-invalid:data-checked:ring-2',
        'data-disabled:cursor-not-allowed data-disabled:opacity-50',
        className,
      )}
      {...props}
    >
      <RadioDot />
    </RadioPrimitive.Root>
  );
}

type RadioCardPart = { kind: 'title' | 'description'; id: string };

/** Lets each RadioCardTitle and RadioCardDescription hand its id to the card, which names and describes the radio with them. */
const RadioCardContext = React.createContext<((part: RadioCardPart) => () => void) | null>(null);

function useRadioCardPart(kind: RadioCardPart['kind']) {
  const register = React.use(RadioCardContext);
  if (!register) throw new Error(`RadioCard${kind === 'title' ? 'Title' : 'Description'} must sit inside a RadioCard.`);
  const id = React.useId();
  React.useLayoutEffect(() => register({ kind, id }), [register, kind, id]);
  return id;
}

type RadioCardProps = Omit<RadioPrimitive.Root.Props<string>, 'className' | 'render' | 'nativeButton'> & {
  className?: string;
};

/**
 * One option of a RadioGroup as a card: a RadioCardTitle and RadioCardDescriptions, such as a line
 * about the option and its price. The whole card is the radio, so it holds no links or buttons, and
 * screen readers hear only the title, as its name, and the descriptions after it. Selected, its edge
 * turns ink and the circle in its corner fills.
 */
function RadioCard({ className, children, 'aria-labelledby': ariaLabelledBy, 'aria-describedby': ariaDescribedBy, ...props }: RadioCardProps) {
  const [parts, setParts] = React.useState<RadioCardPart[]>([]);
  const register = React.useCallback((part: RadioCardPart) => {
    setParts((current) => [...current, part]);
    return () => setParts((current) => current.filter((other) => other !== part));
  }, []);
  const idsOf = (kind: RadioCardPart['kind']) => parts.filter((part) => part.kind === kind).map((part) => part.id);
  const labelledBy = ariaLabelledBy ?? (idsOf('title').join(' ') || undefined);
  const describedBy = [ariaDescribedBy, ...idsOf('description')].filter(Boolean).join(' ') || undefined;

  return (
    <RadioCardContext value={register}>
      <RadioPrimitive.Root<string>
        data-slot="radio-card"
        render={<div />}
        aria-labelledby={labelledBy}
        aria-describedby={describedBy}
        className={cn(
          'group/radio-card relative flex min-w-0 cursor-default items-start gap-3 rounded-xl border border-transparent bg-secondary p-4 text-start shadow-control [-webkit-tap-highlight-color:transparent]',
          // A control, not content: a long press selects the option rather than its text, and a quick second tap never zooms.
          'touch-manipulation select-none',
          'transition-[background-color,box-shadow]',
          'hover:not-data-disabled:not-data-readonly:not-data-checked:bg-muted',
          // Selected, an ink ring replaces the control ring: the edge that tells the cards apart.
          'data-checked:ring-1 data-checked:ring-primary',
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
          'data-invalid:ring-1 data-invalid:ring-destructive aria-invalid:ring-1 aria-invalid:ring-destructive',
          'data-disabled:cursor-not-allowed data-disabled:opacity-50',
          className,
        )}
        {...props}
      >
        <div data-slot="radio-card-content" className="flex min-w-0 flex-1 flex-col gap-0.5">
          {children}
        </div>
        {/* The circle sits on the title's first 20px line. */}
        <span
          aria-hidden
          data-slot="radio-card-mark"
          className={cn(
            circle,
            'mt-0.5',
            'group-data-checked/radio-card:bg-primary group-data-checked/radio-card:shadow-primary',
            'group-data-invalid/radio-card:ring-1 group-data-invalid/radio-card:ring-destructive',
          )}
        >
          <RadioDot />
        </span>
      </RadioPrimitive.Root>
    </RadioCardContext>
  );
}

/** The name of a radio card's option, which screen readers read as the radio's name. */
function RadioCardTitle({ className, ...props }: React.ComponentProps<'div'>) {
  const id = useRadioCardPart('title');
  return <div id={id} data-slot="radio-card-title" className={cn('text-body font-medium break-words text-foreground', className)} {...props} />;
}

/** A line under the title, read by screen readers after the radio's name. A card can hold several, such as a summary and a price. */
function RadioCardDescription({ className, ...props }: React.ComponentProps<'div'>) {
  const id = useRadioCardPart('description');
  return <div id={id} data-slot="radio-card-description" className={cn('text-small break-words text-muted-foreground', className)} {...props} />;
}

export {
  RadioCard,
  RadioCardDescription,
  RadioCardTitle,
  RadioGroup,
  RadioGroupItem,
  type RadioCardProps,
  type RadioGroupItemProps,
  type RadioGroupProps,
};
