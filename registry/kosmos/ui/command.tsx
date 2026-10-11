'use client';

import { Autocomplete as AutocompletePrimitive } from '@base-ui/react/autocomplete';
import { ArrowDown, ArrowUp, CornerDownLeft, Search } from 'lucide-react';
import type * as React from 'react';
import { cn } from '@/registry/kosmos/lib/cn';
import {
  Dialog,
  DialogBackdrop,
  DialogClose,
  DialogDescription,
  DialogPopup,
  DialogPortal,
  DialogTitle,
  DialogViewport,
} from '@/registry/kosmos/ui/dialog';
import { Kbd, KbdGroup } from '@/registry/kosmos/ui/kbd';
import { ScrollArea } from '@/registry/kosmos/ui/scroll-area';

type CommandProps<Item> = AutocompletePrimitive.Root.Props<Item> & {
  className?: string;
  children?: React.ReactNode;
};

/**
 * Holds the search and the list. Takes `items`, a flat list or groups (`{ value, items }`),
 * and filters them by each item's `label` as the user types. The first match stays highlighted,
 * so Enter runs it.
 */
function Command<Item>({
  className,
  children,
  open = true,
  inline = true,
  autoHighlight = 'always',
  keepHighlight = true,
  ...props
}: CommandProps<Item>) {
  return (
    <AutocompletePrimitive.Root
      open={open}
      inline={inline}
      autoHighlight={autoHighlight}
      keepHighlight={keepHighlight}
      {...(props as AutocompletePrimitive.Root.Props<unknown>)}
    >
      <div
        data-slot="command"
        className={cn(
          'flex min-h-0 w-full flex-col overflow-hidden rounded-xl border border-transparent bg-popover text-body text-popover-foreground shadow-popover',
          'in-data-[slot=command-dialog]:rounded-none in-data-[slot=command-dialog]:border-0 in-data-[slot=command-dialog]:bg-transparent in-data-[slot=command-dialog]:shadow-none',
          className,
        )}
      >
        {children}
      </div>
    </AutocompletePrimitive.Root>
  );
}

type CommandDialogProps = Omit<React.ComponentProps<typeof Dialog>, 'children'> &
  Pick<React.ComponentProps<typeof DialogPopup>, 'initialFocus' | 'finalFocus'> & {
    /** Names the palette for screen readers. Not shown. */
    title?: string;
    /** Describes the palette for screen readers. Not shown. */
    description?: string;
    /** The element the palette renders into. Defaults to `document.body`. */
    container?: React.ComponentProps<typeof DialogPortal>['container'];
    className?: string;
    children?: React.ReactNode;
  };

/**
 * A modal dialog for a `Command`, near the top of the screen. It appears and goes without
 * animation, because it opens from a keyboard shortcut. Escape or a click outside closes it.
 */
function CommandDialog({
  title = 'Command palette',
  description = 'Search for a command to run.',
  container,
  className,
  initialFocus,
  finalFocus,
  children,
  ...props
}: CommandDialogProps) {
  return (
    <Dialog {...props}>
      <DialogPortal container={container}>
        <DialogBackdrop className="transition-none" />
        <DialogViewport className="items-start pt-[12vh] sm:pt-[15vh]">
          <DialogPopup
            data-slot="command-dialog"
            initialFocus={initialFocus}
            finalFocus={finalFocus}
            className={cn('max-h-[min(30rem,100%)] max-w-[36rem] overflow-hidden shadow-popover transition-none', className)}
          >
            <DialogTitle className="sr-only">{title}</DialogTitle>
            <DialogDescription className="sr-only">{description}</DialogDescription>
            {children}
            <DialogClose className="sr-only">Close</DialogClose>
          </DialogPopup>
        </DialogViewport>
      </DialogPortal>
    </Dialog>
  );
}

/** The search field, with a search icon. Typing filters the list. */
function CommandInput({ className, ...props }: AutocompletePrimitive.Input.Props) {
  return (
    <AutocompletePrimitive.InputGroup
      data-slot="command-input-group"
      className="flex shrink-0 cursor-text items-center gap-2 border-b border-border px-3"
    >
      <Search aria-hidden className="size-4 shrink-0 text-muted-foreground" />
      {/* No focus outline: the field holds focus the whole time the palette is open, and the highlighted item shows where Enter goes. */}
      <AutocompletePrimitive.Input
        data-slot="command-input"
        aria-label="Search commands"
        className={cn(
          'h-11 w-full min-w-0 bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground sm:text-body',
          className,
        )}
        {...props}
      />
    </AutocompletePrimitive.InputGroup>
  );
}

/**
 * The scrolling list of matches. Pass a function to render each item or group of `items`,
 * or the items themselves. Scrolls past 20rem in a `ScrollArea`: while matches are hidden past an
 * edge, that edge fades out and the scrollbar shows, so rows below the fold are never missed.
 */
function CommandList({ className, ...props }: AutocompletePrimitive.List.Props) {
  return (
    <ScrollArea
      data-slot="command-scroll-area"
      className={cn(
        'flex-[0_1_auto] rounded-none',
        // The palette clips anything outside it, so the list draws its focus outline inside.
        'has-[>[data-slot=scroll-area-viewport]:focus-visible]:-outline-offset-2',
      )}
      // `min-w-0!` beats the content's inline `min-width: fit-content`, so long labels truncate instead of widening the list.
      viewportClassName="max-h-80 overscroll-contain scroll-py-1 [&>[data-slot=scroll-area-content]]:min-w-0!"
    >
      <AutocompletePrimitive.List data-slot="command-list" className={cn('p-1 data-empty:p-0', className)} {...props} />
    </ScrollArea>
  );
}

/** Shows its text only while nothing matches the search, and announces it to screen readers. */
function CommandEmpty({ className, ...props }: AutocompletePrimitive.Empty.Props) {
  return (
    <AutocompletePrimitive.Empty
      data-slot="command-empty"
      className={cn('px-4 text-center text-body text-muted-foreground not-empty:py-10', className)}
      {...props}
    />
  );
}

/** One group of matches. Pass its `items`, then a `CommandGroupLabel` and a `CommandCollection`. */
function CommandGroup({ className, ...props }: AutocompletePrimitive.Group.Props) {
  return <AutocompletePrimitive.Group data-slot="command-group" className={cn('not-last:pb-1', className)} {...props} />;
}

function CommandGroupLabel({ className, ...props }: AutocompletePrimitive.GroupLabel.Props) {
  return (
    <AutocompletePrimitive.GroupLabel
      data-slot="command-group-label"
      className={cn('px-2 pt-2 pb-1 text-caption font-medium text-muted-foreground select-none', className)}
      {...props}
    />
  );
}

/** Renders each item of the group it sits in, through a function child. */
const CommandCollection = AutocompletePrimitive.Collection;

/** One command. Pass the item as `value`; clicking it or Enter while it is highlighted runs `onClick`. */
function CommandItem({ className, ...props }: AutocompletePrimitive.Item.Props) {
  return (
    <AutocompletePrimitive.Item
      data-slot="command-item"
      className={cn(
        'flex min-h-9 cursor-default scroll-my-1 items-center gap-2 rounded-lg px-2 py-1.5 text-body outline-none select-none',
        'transition-[background-color] duration-instant',
        'data-highlighted:bg-accent data-disabled:pointer-events-none data-disabled:opacity-50',
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}

function CommandSeparator({ className, ...props }: AutocompletePrimitive.Separator.Props) {
  return (
    <AutocompletePrimitive.Separator
      data-slot="command-separator"
      className={cn('-mx-1 my-1 border-t border-border', className)}
      {...props}
    />
  );
}

/** The shortcut that runs a command, at the end of its item. Put a `Kbd` per key inside. */
function CommandShortcut({ className, ...props }: React.ComponentProps<typeof KbdGroup>) {
  return <KbdGroup data-slot="command-shortcut" className={cn('ms-auto ps-4', className)} {...props} />;
}

/** A bar under the list. Without children it shows the keys that move through the list, run a command and close. */
function CommandFooter({ className, children, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="command-footer"
      className={cn(
        'flex shrink-0 flex-wrap items-center gap-x-4 gap-y-1 border-t border-border px-3 py-2 text-caption text-muted-foreground',
        className,
      )}
      {...props}
    >
      {children ?? (
        <>
          <span className="flex items-center gap-1.5">
            <KbdGroup>
              <Kbd>
                <ArrowUp role="img" aria-label="Up arrow" />
              </Kbd>
              <Kbd>
                <ArrowDown role="img" aria-label="Down arrow" />
              </Kbd>
            </KbdGroup>
            Move
          </span>
          <span className="flex items-center gap-1.5">
            <Kbd>
              <CornerDownLeft role="img" aria-label="Enter" />
            </Kbd>
            Run
          </span>
          <span className="flex items-center gap-1.5">
            <Kbd>Esc</Kbd>
            Close
          </span>
        </>
      )}
    </div>
  );
}

export {
  Command,
  CommandCollection,
  CommandDialog,
  CommandEmpty,
  CommandFooter,
  CommandGroup,
  CommandGroupLabel,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
  type CommandDialogProps,
  type CommandProps,
};
