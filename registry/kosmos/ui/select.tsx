'use client';

import { Select as SelectPrimitive } from '@base-ui/react/select';
import { Check, ChevronDown, ChevronsUpDown, ChevronUp } from 'lucide-react';
import * as React from 'react';
import { cn } from '@/registry/kosmos/lib/cn';

const SelectTriggerId = React.createContext<string | undefined>(undefined);

/** Holds the value and open state. Takes `items` so `SelectValue` can show a label instead of the raw value. */
function Select<Value, Multiple extends boolean | undefined = false>({ id, ...props }: SelectPrimitive.Root.Props<Value, Multiple>) {
  const generatedId = React.useId();
  const triggerId = id ?? generatedId;
  return (
    <SelectTriggerId value={triggerId}>
      <SelectPrimitive.Root id={triggerId} {...props} />
    </SelectTriggerId>
  );
}

type SelectTriggerProps = Omit<SelectPrimitive.Trigger.Props, 'className'> & { className?: string };

/** The button that shows the value and opens the list. Put a `SelectValue` inside. */
function SelectTrigger({ className, children, ...props }: SelectTriggerProps) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      className={cn(
        // No width: it hugs its value in a row and fills a vertical Field, like an Input.
        'inline-flex h-8.5 min-w-0 items-center justify-between gap-2 rounded-lg border border-transparent bg-secondary ps-3 pe-2.5 text-body text-secondary-foreground shadow-field select-none [-webkit-tap-highlight-color:transparent]',
        'transition-[background-color,box-shadow]',
        'hover:not-data-disabled:bg-muted data-popup-open:bg-muted',
        // The transparent outline paints only in forced-colors mode, which drops the box-shadow focus line and halo.
        'focus-visible:outline-1 focus-visible:outline-offset-0 focus-visible:outline-transparent focus-visible:ring-offset-1 focus-visible:ring-offset-ring focus-visible:ring-3 focus-visible:ring-ring/20',
        'data-invalid:ring-1 data-invalid:ring-destructive aria-invalid:ring-1 aria-invalid:ring-destructive',
        'data-invalid:focus-visible:ring-offset-destructive data-invalid:focus-visible:ring-3 data-invalid:focus-visible:ring-destructive/20 aria-invalid:focus-visible:ring-offset-destructive aria-invalid:focus-visible:ring-3 aria-invalid:focus-visible:ring-destructive/20',
        'data-disabled:cursor-not-allowed data-disabled:opacity-50',
        className,
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon data-slot="select-icon" className="flex shrink-0 text-muted-foreground">
        <ChevronsUpDown aria-hidden className="size-3.5" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

type SelectValueProps = Omit<SelectPrimitive.Value.Props, 'className'> & { className?: string };

/** The selected item's label, or the `placeholder` while nothing is selected. */
function SelectValue({ className, ...props }: SelectValueProps) {
  return (
    <SelectPrimitive.Value
      data-slot="select-value"
      className={cn('min-w-0 flex-1 truncate text-start data-placeholder:text-muted-foreground', className)}
      {...props}
    />
  );
}

type SelectContentProps = Omit<SelectPrimitive.Popup.Props, 'className'> &
  Pick<SelectPrimitive.Positioner.Props, 'side' | 'sideOffset' | 'align' | 'alignOffset' | 'alignItemWithTrigger'> & {
    className?: string;
  };

/**
 * The list in a popup, named by its trigger. By default it opens over the trigger with the selected item on top of
 * the value (`alignItemWithTrigger`); set it to `false` to open below the trigger instead.
 */
function SelectContent({
  className,
  children,
  side = 'bottom',
  sideOffset = 4,
  align = 'start',
  alignOffset,
  alignItemWithTrigger = true,
  ...props
}: SelectContentProps) {
  const triggerId = React.use(SelectTriggerId);
  // The list takes its trigger's name: a combobox gives a reader its value instead of its label when another element points to it.
  const [name, setName] = React.useState<{ label?: string; labelledBy?: string }>({});
  const nameList = (list: HTMLElement | null) => {
    const trigger = list && triggerId ? document.getElementById(triggerId) : null;
    const label = trigger?.getAttribute('aria-label') ?? undefined;
    const labelledBy = trigger?.getAttribute('aria-labelledby') ?? undefined;
    if (list) setName((current) => (current.label === label && current.labelledBy === labelledBy ? current : { label, labelledBy }));
  };
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Positioner
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
        alignItemWithTrigger={alignItemWithTrigger}
        className="z-50 outline-none select-none"
      >
        <SelectPrimitive.Popup
          data-slot="select-content"
          className={cn(
            'relative max-h-(--available-height) max-w-(--available-width) min-w-(--anchor-width) origin-(--transform-origin) overflow-hidden rounded-lg border border-transparent bg-popover text-popover-foreground shadow-popover dark:scheme-dark',
            'transition-[opacity,scale] duration-base data-ending-style:duration-fast',
            'data-starting-style:opacity-0 data-ending-style:opacity-0',
            'motion-safe:data-starting-style:scale-[0.97] motion-safe:data-ending-style:scale-[0.97]',
            className,
          )}
          {...props}
        >
          <SelectPrimitive.ScrollUpArrow className="absolute inset-x-0 top-0 z-10 flex h-5 items-center justify-center bg-popover text-muted-foreground">
            <ChevronUp aria-hidden className="size-3.5" />
          </SelectPrimitive.ScrollUpArrow>
          <SelectPrimitive.List data-slot="select-list" ref={nameList} aria-label={name.label} aria-labelledby={name.labelledBy} className="max-h-(--available-height) scroll-py-1 overflow-y-auto overscroll-contain p-1">
            {children}
          </SelectPrimitive.List>
          <SelectPrimitive.ScrollDownArrow className="absolute inset-x-0 bottom-0 z-10 flex h-5 items-center justify-center bg-popover text-muted-foreground">
            <ChevronDown aria-hidden className="size-3.5" />
          </SelectPrimitive.ScrollDownArrow>
        </SelectPrimitive.Popup>
      </SelectPrimitive.Positioner>
    </SelectPrimitive.Portal>
  );
}

type SelectItemProps = Omit<SelectPrimitive.Item.Props, 'className'> & { className?: string };

/** One option. Its text is what the trigger shows and what typing a letter jumps to. */
function SelectItem({ className, children, ...props }: SelectItemProps) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        'relative flex min-h-7.5 cursor-default items-center gap-2 rounded-[calc(var(--radius-lg)-4px)] py-1.5 ps-2 pe-8 text-body outline-none select-none [-webkit-tap-highlight-color:transparent]',
        'transition-[background-color] duration-instant',
        'data-highlighted:bg-accent data-disabled:pointer-events-none data-disabled:opacity-50',
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5 [&_svg:not([class*='text-'])]:text-muted-foreground",
        className,
      )}
      {...props}
    >
      {/* Wraps instead of truncating: the list is where a value cut short in the trigger can be read in full. */}
      <SelectPrimitive.ItemText className="min-w-0 flex-1 wrap-break-word">{children}</SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator className="absolute end-2 flex items-center">
        <Check aria-hidden className="size-3.5" />
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  );
}

type SelectGroupProps = Omit<SelectPrimitive.Group.Props, 'className'> & { className?: string };

/** Groups related items under a `SelectGroupLabel`. */
function SelectGroup({ className, ...props }: SelectGroupProps) {
  return <SelectPrimitive.Group data-slot="select-group" className={cn('flex flex-col', className)} {...props} />;
}

type SelectGroupLabelProps = Omit<SelectPrimitive.GroupLabel.Props, 'className'> & { className?: string };

function SelectGroupLabel({ className, ...props }: SelectGroupLabelProps) {
  return (
    <SelectPrimitive.GroupLabel
      data-slot="select-group-label"
      className={cn('px-2 pt-2 pb-1 text-caption font-medium text-muted-foreground', className)}
      {...props}
    />
  );
}

type SelectSeparatorProps = Omit<SelectPrimitive.Separator.Props, 'className'> & { className?: string };

function SelectSeparator({ className, ...props }: SelectSeparatorProps) {
  return <SelectPrimitive.Separator data-slot="select-separator" className={cn('-mx-1 my-1 border-t border-border', className)} {...props} />;
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectGroupLabel,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
  type SelectContentProps,
  type SelectGroupLabelProps,
  type SelectGroupProps,
  type SelectItemProps,
  type SelectSeparatorProps,
  type SelectTriggerProps,
  type SelectValueProps,
};
