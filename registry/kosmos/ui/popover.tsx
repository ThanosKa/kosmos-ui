'use client';

import { Popover as PopoverPrimitive } from '@base-ui/react/popover';
import type * as React from 'react';
import { cn } from '@/registry/kosmos/lib/cn';

function Popover(props: PopoverPrimitive.Root.Props) {
  return <PopoverPrimitive.Root data-slot="popover" {...props} />;
}

function PopoverTrigger(props: PopoverPrimitive.Trigger.Props) {
  return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />;
}

function PopoverClose(props: PopoverPrimitive.Close.Props) {
  return <PopoverPrimitive.Close data-slot="popover-close" {...props} />;
}

function PopoverPortal(props: PopoverPrimitive.Portal.Props) {
  return <PopoverPrimitive.Portal data-slot="popover-portal" {...props} />;
}

/** Places the popup next to its trigger: 8px away, 16px clear of the screen edges, flipping when out of room. */
function PopoverPositioner({
  className,
  sideOffset = 8,
  collisionPadding = 16,
  ...props
}: PopoverPrimitive.Positioner.Props) {
  return (
    <PopoverPrimitive.Positioner
      data-slot="popover-positioner"
      sideOffset={sideOffset}
      collisionPadding={collisionPadding}
      className={cn('isolate z-50', className)}
      {...props}
    />
  );
}

/** The popover surface. Grows out of its trigger (`scale-[0.97]` plus a fade), or only fades under reduced motion. */
function PopoverPopup({ className, ...props }: PopoverPrimitive.Popup.Props) {
  return (
    <PopoverPrimitive.Popup
      data-slot="popover-popup"
      className={cn(
        'flex max-h-(--available-height) w-72 max-w-(--available-width) origin-(--transform-origin) flex-col gap-3 overflow-y-auto overscroll-contain rounded-xl border border-transparent bg-popover p-4 text-body text-popover-foreground shadow-popover',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
        'transition-[opacity,scale] duration-base',
        'data-starting-style:opacity-0 data-ending-style:opacity-0 data-ending-style:duration-fast',
        'motion-safe:data-starting-style:scale-[0.97] motion-safe:data-ending-style:scale-[0.97]',
        className,
      )}
      {...props}
    />
  );
}

type PopoverContentProps = PopoverPrimitive.Popup.Props &
  Pick<
    PopoverPrimitive.Positioner.Props,
    'side' | 'sideOffset' | 'align' | 'alignOffset' | 'collisionPadding' | 'anchor'
  > & {
    /** The element the popover renders into. Defaults to `document.body`. */
    container?: PopoverPrimitive.Portal.Props['container'];
  };

/** Portal, positioner and popup in one part. Opens below the trigger, centered, unless `side` and `align` say otherwise. */
function PopoverContent({
  side,
  sideOffset,
  align,
  alignOffset,
  collisionPadding,
  anchor,
  container,
  ...props
}: PopoverContentProps) {
  return (
    <PopoverPortal container={container}>
      <PopoverPositioner
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
        collisionPadding={collisionPadding}
        anchor={anchor}
      >
        <PopoverPopup data-slot="popover-content" {...props} />
      </PopoverPositioner>
    </PopoverPortal>
  );
}

function PopoverHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="popover-header" className={cn('flex flex-col gap-0.5', className)} {...props} />;
}

function PopoverTitle({ className, ...props }: PopoverPrimitive.Title.Props) {
  return (
    <PopoverPrimitive.Title
      data-slot="popover-title"
      className={cn('text-body font-medium', className)}
      {...props}
    />
  );
}

function PopoverDescription({ className, ...props }: PopoverPrimitive.Description.Props) {
  return (
    <PopoverPrimitive.Description
      data-slot="popover-description"
      className={cn('text-small text-pretty text-muted-foreground', className)}
      {...props}
    />
  );
}

export {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverPopup,
  PopoverPortal,
  PopoverPositioner,
  PopoverTitle,
  PopoverTrigger,
  type PopoverContentProps,
};
