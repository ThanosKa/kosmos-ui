'use client';

import { Popover as PopoverPrimitive } from '@base-ui/react/popover';
import * as React from 'react';
import { cn } from '@/registry/kosmos/lib/cn';
import { ScrollArea } from '@/registry/kosmos/ui/scroll-area';

/**
 * Keeps this part's `data-slot` when `render` is an element that brings its own, such as a Button
 * rendered on the server, whose `data-slot="button"` would otherwise win the prop merge.
 */
function withSlot<Render>(render: Render, slot: string) {
  return React.isValidElement<{ 'data-slot'?: string }>(render) ? React.cloneElement(render, { 'data-slot': slot }) : render;
}

function Popover(props: PopoverPrimitive.Root.Props) {
  return <PopoverPrimitive.Root data-slot="popover" {...props} />;
}

function PopoverTrigger({ render, ...props }: PopoverPrimitive.Trigger.Props) {
  return <PopoverPrimitive.Trigger data-slot="popover-trigger" render={withSlot(render, 'popover-trigger')} {...props} />;
}

function PopoverClose({ render, ...props }: PopoverPrimitive.Close.Props) {
  return <PopoverPrimitive.Close data-slot="popover-close" render={withSlot(render, 'popover-close')} {...props} />;
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

/**
 * The popover surface. Grows out of its trigger (`scale-[0.97]` plus a fade), or only fades under reduced motion.
 * The content stacks 12px apart and scrolls in a `ScrollArea` when it is taller than the room it has: the edge with
 * content hidden past it fades out. `body={false}` leaves out the scroll area and its padding, for content that lays
 * itself out, such as a header, a list that scrolls on its own and a footer.
 */
function PopoverPopup({
  className,
  children,
  body = true,
  ...props
}: PopoverPrimitive.Popup.Props & { body?: boolean }) {
  return (
    <PopoverPrimitive.Popup
      data-slot="popover-popup"
      className={cn(
        'flex max-h-(--available-height) w-72 max-w-(--available-width) origin-(--transform-origin) flex-col overflow-hidden rounded-xl border border-transparent bg-popover text-body text-popover-foreground shadow-popover',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
        'transition-[opacity,scale] duration-base',
        'data-starting-style:opacity-0 data-ending-style:opacity-0 data-ending-style:duration-fast',
        'motion-safe:data-starting-style:scale-[0.97] motion-safe:data-ending-style:scale-[0.97]',
        className,
      )}
      {...props}
    >
      {body ? (
        <ScrollArea
          data-slot="popover-scroll-area"
          className={cn(
            'rounded-[inherit]',
            // The popup clips anything outside it, so the scrolling content draws its focus outline inside.
            'has-[>[data-slot=scroll-area-viewport]:focus-visible]:-outline-offset-2',
          )}
          // The 16px padding already clears the scrollbar. `min-w-0!` beats the content's inline `min-width: fit-content`, so text wraps to the popup's width.
          viewportClassName="overscroll-contain data-has-overflow-y:pe-0 [&>[data-slot=scroll-area-content]]:min-w-0!"
        >
          <div data-slot="popover-body" className="flex flex-col gap-3 p-4">
            {children}
          </div>
        </ScrollArea>
      ) : (
        children
      )}
    </PopoverPrimitive.Popup>
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
