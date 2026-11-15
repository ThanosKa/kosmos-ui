'use client';

import { Combobox as ComboboxPrimitive } from '@base-ui/react/combobox';
import { Check, ChevronsUpDown, CircleAlert, X } from 'lucide-react';
import { cn } from '@/registry/kosmos/lib/cn';
import { Button } from '@/registry/kosmos/ui/button';
import { ScrollArea } from '@/registry/kosmos/ui/scroll-area';

/**
 * Holds the value, the typed query and the open state. Pass `items` and it filters them by their label as people type;
 * `multiple` makes the value an array, shown as chips in a `ComboboxChips`.
 */
const Combobox = ComboboxPrimitive.Root;

/** Renders the selected value through a function child, such as the chips of a `multiple` combobox. */
const ComboboxValue = ComboboxPrimitive.Value;

/**
 * The field surface, shared by the single input and the chips: the same ring, fill and focus as Input. The field lights
 * up while anything inside it has keyboard focus, since the input inside draws no outline of its own.
 */
const fieldClass = cn(
  'flex w-full min-w-0 rounded-lg border border-transparent bg-secondary text-foreground shadow-field',
  'transition-[box-shadow]',
  // The transparent outline paints only in forced-colors mode, which drops the box-shadow focus line and halo.
  'has-focus-visible:outline-1 has-focus-visible:outline-offset-0 has-focus-visible:outline-transparent has-focus-visible:ring-offset-1 has-focus-visible:ring-offset-ring has-focus-visible:ring-3 has-focus-visible:ring-ring/20',
  // Invalid from a Field (`data-invalid`) or from `aria-invalid` on the input.
  'data-invalid:ring-1 data-invalid:ring-destructive has-[input[aria-invalid=true]]:ring-1 has-[input[aria-invalid=true]]:ring-destructive',
  'data-invalid:has-focus-visible:ring-offset-destructive data-invalid:has-focus-visible:ring-3 data-invalid:has-focus-visible:ring-destructive/20',
  'has-[input[aria-invalid=true]]:has-focus-visible:ring-offset-destructive has-[input[aria-invalid=true]]:has-focus-visible:ring-3 has-[input[aria-invalid=true]]:has-focus-visible:ring-destructive/20',
  'data-disabled:cursor-not-allowed data-disabled:opacity-50',
);

const inputClass =
  'min-w-0 flex-1 bg-transparent text-base text-ellipsis text-foreground outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed sm:text-body';

/** The small buttons at the end of the field. Quiet until hovered, and out of the Tab order: the keyboard works from the input. */
const fieldButtonClass = 'text-muted-foreground transition-[background-color,color] hover:not-data-disabled:text-foreground';

type ComboboxInputProps = Omit<ComboboxPrimitive.Input.Props, 'className'> & {
  /** Classes for the field around the input, where the width goes. */
  className?: string;
  /** Shows the chevron button that opens the list. On by default. */
  showTrigger?: boolean;
  /** Shows a button that clears the value, while there is one. Off by default. */
  showClear?: boolean;
};

/**
 * The field of a single-value combobox: a text input that filters the list, with a chevron that opens it. Inside a
 * `Field` it takes its label and error from the field; on its own it needs an `aria-label`.
 */
function ComboboxInput({ className, showTrigger = true, showClear = false, ...props }: ComboboxInputProps) {
  return (
    <ComboboxPrimitive.InputGroup data-slot="combobox-input-group" className={cn(fieldClass, 'h-8.5 items-center gap-0.5 pe-1', className)}>
      <ComboboxPrimitive.Input data-slot="combobox-input" className={cn(inputClass, 'h-full ps-3 pe-1')} {...props} />
      {showClear ? (
        <ComboboxPrimitive.Clear
          data-slot="combobox-clear"
          aria-label="Clear"
          render={<Button variant="item" size="icon-sm" className={fieldButtonClass} />}
        >
          <X aria-hidden />
        </ComboboxPrimitive.Clear>
      ) : null}
      {showTrigger ? (
        <ComboboxPrimitive.Trigger
          data-slot="combobox-trigger"
          aria-label="Show options"
          render={<Button variant="item" size="icon-sm" className={fieldButtonClass} />}
        >
          <ChevronsUpDown aria-hidden />
        </ComboboxPrimitive.Trigger>
      ) : null}
    </ComboboxPrimitive.InputGroup>
  );
}

type ComboboxChipsProps = Omit<ComboboxPrimitive.InputGroup.Props, 'className'> & { className?: string };

/**
 * The field of a `multiple` combobox: the chosen values as chips, then a `ComboboxChipsInput`, wrapping onto more lines
 * as they fill it. From the start of the input, Left Arrow moves onto the chips and Backspace removes the last one.
 */
function ComboboxChips({ className, children, ...props }: ComboboxChipsProps) {
  return (
    <ComboboxPrimitive.InputGroup data-slot="combobox-chips" className={cn(fieldClass, 'min-h-8.5 cursor-text', className)} {...props}>
      <ComboboxPrimitive.Chips className="flex min-w-0 flex-1 flex-wrap items-center gap-1 p-1.25">{children}</ComboboxPrimitive.Chips>
    </ComboboxPrimitive.InputGroup>
  );
}

type ComboboxChipProps = Omit<ComboboxPrimitive.Chip.Props, 'className'> & {
  className?: string;
  /** Shows the × that removes the chip. On by default; off for a value people cannot remove. */
  showRemove?: boolean;
  /** Names the × for screen readers. Defaults to "Remove" and the chip's text. */
  removeLabel?: string;
  /** Marks a value that will not be accepted, such as a mistyped email: red, with an alert icon. */
  invalid?: boolean;
};

/** One chosen value in a `ComboboxChips`. Backspace or Delete removes it while it has focus. */
function ComboboxChip({ className, children, showRemove = true, removeLabel, invalid = false, ...props }: ComboboxChipProps) {
  const label = typeof children === 'string' ? children : undefined;
  return (
    <ComboboxPrimitive.Chip
      data-slot="combobox-chip"
      data-invalid={invalid ? '' : undefined}
      className={cn(
        'group/chip inline-flex h-5.5 max-w-full min-w-0 cursor-default items-center gap-1 rounded-full border border-transparent bg-secondary ps-2 pe-2 text-caption font-medium text-secondary-foreground shadow-control select-none',
        'has-data-[slot=combobox-chip-remove]:pe-0.5 data-invalid:ps-1.5',
        'data-invalid:border-tint-red-border data-invalid:bg-tint-red data-invalid:text-tint-red-foreground data-invalid:shadow-none',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
        className,
      )}
      {...props}
    >
      {invalid ? <CircleAlert aria-hidden className="size-3 shrink-0" /> : null}
      <span className="min-w-0 truncate" title={label}>
        {children}
      </span>
      {invalid ? <span className="sr-only">, not valid</span> : null}
      {showRemove ? (
        <ComboboxPrimitive.ChipRemove
          data-slot="combobox-chip-remove"
          aria-label={removeLabel ?? (label ? `Remove ${label}` : 'Remove')}
          className={cn(
            'relative flex size-4.5 shrink-0 items-center justify-center rounded-full text-muted-foreground [-webkit-tap-highlight-color:transparent]',
            'transition-[background-color,color] hover:not-data-disabled:bg-accent hover:not-data-disabled:text-foreground',
            'group-data-invalid/chip:text-tint-red-foreground group-data-invalid/chip:hover:not-data-disabled:text-tint-red-foreground',
            // A hit area 4px past the 18px circle, so the × is easier to hit than it looks.
            "after:absolute after:-inset-1 after:content-['']",
            'data-disabled:hidden',
          )}
        >
          <X aria-hidden className="size-3" />
        </ComboboxPrimitive.ChipRemove>
      ) : null}
    </ComboboxPrimitive.Chip>
  );
}

type ComboboxChipsInputProps = Omit<ComboboxPrimitive.Input.Props, 'className'> & { className?: string };

/** The text input after the chips. It takes the room left on the last line, and a line of its own when there is too little. */
function ComboboxChipsInput({ className, ...props }: ComboboxChipsInputProps) {
  return <ComboboxPrimitive.Input data-slot="combobox-chips-input" className={cn(inputClass, 'h-5.5 min-w-12 px-1.75', className)} {...props} />;
}

type ComboboxContentProps = Omit<ComboboxPrimitive.Popup.Props, 'className'> &
  Pick<ComboboxPrimitive.Positioner.Props, 'side' | 'sideOffset' | 'align' | 'alignOffset' | 'collisionPadding' | 'anchor'> & {
    className?: string;
    /** The element the list renders into. Defaults to `document.body`. */
    container?: ComboboxPrimitive.Portal.Props['container'];
  };

/**
 * The popup under the field, as wide as it and at least 11rem. Grows out of the field (`scale-[0.97]` plus a fade), or
 * only fades under reduced motion. Put a `ComboboxEmpty` and a `ComboboxList` inside.
 */
function ComboboxContent({
  className,
  side = 'bottom',
  sideOffset = 4,
  align = 'start',
  alignOffset,
  collisionPadding = 16,
  anchor,
  container,
  ...props
}: ComboboxContentProps) {
  return (
    <ComboboxPrimitive.Portal container={container}>
      <ComboboxPrimitive.Positioner
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
        collisionPadding={collisionPadding}
        anchor={anchor}
        className="isolate z-50 outline-none"
      >
        <ComboboxPrimitive.Popup
          data-slot="combobox-content"
          className={cn(
            'flex max-h-[min(var(--available-height),20rem)] w-(--anchor-width) max-w-(--available-width) min-w-44 origin-(--transform-origin) flex-col overflow-hidden rounded-lg border border-transparent bg-popover text-body text-popover-foreground shadow-popover dark:scheme-dark',
            'transition-[opacity,scale] duration-base',
            'data-starting-style:opacity-0 data-ending-style:opacity-0 data-ending-style:duration-fast',
            'motion-safe:data-starting-style:scale-[0.97] motion-safe:data-ending-style:scale-[0.97]',
            className,
          )}
          {...props}
        />
      </ComboboxPrimitive.Positioner>
    </ComboboxPrimitive.Portal>
  );
}

type ComboboxListProps = Omit<ComboboxPrimitive.List.Props, 'className'> & { className?: string };

/**
 * The matching items, through a function child for each item (or group) of `items`. Scrolls in a `ScrollArea` once it
 * outgrows the popup: the edge with items hidden past it fades out.
 */
function ComboboxList({ className, ...props }: ComboboxListProps) {
  return (
    <ScrollArea
      data-slot="combobox-scroll-area"
      // The input keeps focus while the list is open, and the highlighted item scrolls itself into view.
      focusable={false}
      className="flex-[0_1_auto] rounded-none"
      // `min-w-0!` beats the content's inline `min-width: fit-content`, so long labels wrap instead of widening the list.
      viewportClassName="overscroll-contain scroll-py-1 [&>[data-slot=scroll-area-content]]:min-w-0!"
    >
      <ComboboxPrimitive.List data-slot="combobox-list" className={cn('p-1 data-empty:p-0', className)} {...props} />
    </ScrollArea>
  );
}

type ComboboxItemProps = Omit<ComboboxPrimitive.Item.Props, 'className'> & { className?: string };

/** One option, with a check while it is chosen. Pass the item itself as `value`. */
function ComboboxItem({ className, children, ...props }: ComboboxItemProps) {
  return (
    <ComboboxPrimitive.Item
      data-slot="combobox-item"
      className={cn(
        'relative flex min-h-7.5 cursor-default scroll-my-1 items-center gap-2 rounded-[calc(var(--radius-lg)-4px)] py-1.5 ps-2 pe-8 text-body outline-none select-none',
        'transition-[background-color] duration-instant',
        'data-highlighted:bg-accent data-disabled:pointer-events-none data-disabled:opacity-50',
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5 [&_svg:not([class*='text-'])]:text-muted-foreground",
        className,
      )}
      {...props}
    >
      {/* Wraps instead of truncating: the list is where a long option can be read in full. */}
      <span className="min-w-0 flex-1 wrap-break-word">{children}</span>
      <ComboboxPrimitive.ItemIndicator className="absolute end-2 flex items-center">
        <Check aria-hidden className="size-3.5" />
      </ComboboxPrimitive.ItemIndicator>
    </ComboboxPrimitive.Item>
  );
}

type ComboboxEmptyProps = Omit<ComboboxPrimitive.Empty.Props, 'className'> & { className?: string };

/** Shows its text only while nothing matches the query, and announces it to screen readers. */
function ComboboxEmpty({ className, ...props }: ComboboxEmptyProps) {
  return (
    <ComboboxPrimitive.Empty
      data-slot="combobox-empty"
      className={cn('px-3 text-center text-body wrap-anywhere text-muted-foreground not-empty:py-6', className)}
      {...props}
    />
  );
}

type ComboboxGroupProps = Omit<ComboboxPrimitive.Group.Props, 'className'> & { className?: string };

/** One group of `items` (`{ value, items }`). Put a `ComboboxGroupLabel` and a `ComboboxCollection` inside. */
function ComboboxGroup({ className, ...props }: ComboboxGroupProps) {
  return <ComboboxPrimitive.Group data-slot="combobox-group" className={cn('flex flex-col not-last:pb-1', className)} {...props} />;
}

type ComboboxGroupLabelProps = Omit<ComboboxPrimitive.GroupLabel.Props, 'className'> & { className?: string };

function ComboboxGroupLabel({ className, ...props }: ComboboxGroupLabelProps) {
  return (
    <ComboboxPrimitive.GroupLabel
      data-slot="combobox-group-label"
      className={cn('px-2 pt-2 pb-1 text-caption font-medium text-muted-foreground select-none', className)}
      {...props}
    />
  );
}

/** Renders each item of the group it sits in, through a function child. */
const ComboboxCollection = ComboboxPrimitive.Collection;

type ComboboxSeparatorProps = Omit<ComboboxPrimitive.Separator.Props, 'className'> & { className?: string };

function ComboboxSeparator({ className, ...props }: ComboboxSeparatorProps) {
  return <ComboboxPrimitive.Separator data-slot="combobox-separator" className={cn('-mx-1 my-1 border-t border-border', className)} {...props} />;
}

export {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxCollection,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxGroupLabel,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxSeparator,
  ComboboxValue,
  type ComboboxChipProps,
  type ComboboxChipsInputProps,
  type ComboboxChipsProps,
  type ComboboxContentProps,
  type ComboboxEmptyProps,
  type ComboboxGroupLabelProps,
  type ComboboxGroupProps,
  type ComboboxInputProps,
  type ComboboxItemProps,
  type ComboboxListProps,
  type ComboboxSeparatorProps,
};
