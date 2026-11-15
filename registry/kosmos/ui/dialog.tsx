'use client';

import { Dialog as DialogPrimitive } from '@base-ui/react/dialog';
import { XIcon } from 'lucide-react';
import * as React from 'react';
import { cn } from '@/registry/kosmos/lib/cn';
import { Button } from '@/registry/kosmos/ui/button';
import { ScrollArea } from '@/registry/kosmos/ui/scroll-area';

/**
 * Keeps this part's `data-slot` when `render` is an element that brings its own, such as a Button
 * rendered on the server, whose `data-slot="button"` would otherwise win the prop merge.
 */
function withSlot<Render>(render: Render, slot: string) {
  return React.isValidElement<{ 'data-slot'?: string }>(render) ? React.cloneElement(render, { 'data-slot': slot }) : render;
}

function Dialog(props: DialogPrimitive.Root.Props) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}

function DialogTrigger({ render, ...props }: DialogPrimitive.Trigger.Props) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" render={withSlot(render, 'dialog-trigger')} {...props} />;
}

function DialogPortal(props: DialogPrimitive.Portal.Props) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />;
}

function DialogClose({ render, ...props }: DialogPrimitive.Close.Props) {
  return <DialogPrimitive.Close data-slot="dialog-close" render={withSlot(render, 'dialog-close')} {...props} />;
}

/** The scrim behind the dialog. Fades in and out; nothing moves, so reduced motion keeps it as is. */
function DialogBackdrop({ className, ...props }: DialogPrimitive.Backdrop.Props) {
  return (
    <DialogPrimitive.Backdrop
      data-slot="dialog-backdrop"
      className={cn(
        'fixed inset-0 z-50 bg-scrim supports-[-webkit-touch-callout:none]:absolute',
        'transition-opacity duration-overlay data-starting-style:opacity-0 data-ending-style:opacity-0 data-ending-style:duration-fast',
        className,
      )}
      {...props}
    />
  );
}

/** Centers the popup and caps its height at the screen; `DialogBody` scrolls inside it. Lets clicks through around the popup. */
function DialogViewport({ className, ...props }: DialogPrimitive.Viewport.Props) {
  return (
    <DialogPrimitive.Viewport
      data-slot="dialog-viewport"
      className={cn('pointer-events-none fixed inset-0 z-50 flex items-center justify-center p-4', className)}
      {...props}
    />
  );
}

/** The dialog surface alone, for building a custom layout inside `DialogPortal` and `DialogViewport`. */
function DialogPopup({ className, ...props }: DialogPrimitive.Popup.Props) {
  return (
    <DialogPrimitive.Popup
      data-slot="dialog-popup"
      className={cn(
        'group/dialog pointer-events-auto relative flex max-h-full w-full max-w-[30rem] min-w-0 flex-col rounded-xl border border-transparent bg-popover text-body text-popover-foreground shadow-modal',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
        'transition-[opacity,scale] duration-overlay',
        'data-starting-style:opacity-0 data-ending-style:opacity-0 data-ending-style:duration-fast',
        'motion-safe:data-starting-style:scale-95 motion-safe:data-ending-style:scale-95',
        className,
      )}
      {...props}
    />
  );
}

type DialogContentProps = DialogPrimitive.Popup.Props & {
  /** Shows a close button in the top corner. Turn it off only when the footer has a way out. */
  showCloseButton?: boolean;
  /** The element the dialog renders into. Defaults to `document.body`. */
  container?: DialogPrimitive.Portal.Props['container'];
};

/** Portal, backdrop, viewport and popup in one part, with a close button in the top corner. */
function DialogContent({ className, children, showCloseButton = true, container, ...props }: DialogContentProps) {
  return (
    <DialogPortal container={container}>
      <DialogBackdrop />
      <DialogViewport>
        <DialogPopup
          data-slot="dialog-content"
          data-close-button={showCloseButton ? '' : undefined}
          className={className}
          {...props}
        >
          {children}
          {showCloseButton ? (
            <DialogPrimitive.Close
              data-slot="dialog-close"
              aria-label="Close"
              render={<Button variant="ghost" size="icon-sm" className="absolute end-4 top-5 text-muted-foreground after:absolute after:-inset-1.5" />}
            >
              <XIcon aria-hidden />
            </DialogPrimitive.Close>
          ) : null}
        </DialogPopup>
      </DialogViewport>
    </DialogPortal>
  );
}

/** Title and description. Leaves room on the end side when the close button shows. */
function DialogHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="dialog-header"
      className={cn('flex shrink-0 flex-col gap-1 px-5 pt-5 group-data-close-button/dialog:pe-12', className)}
      {...props}
    />
  );
}

/**
 * The content between header and footer. Scrolls when the dialog reaches the screen height, in a
 * `ScrollArea`: the edge with content hidden past it fades out. `className` styles the padded box inside.
 */
function DialogBody({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <ScrollArea
      data-slot="dialog-body-scroll-area"
      className={cn(
        'min-h-0 flex-1',
        // The scrolling body spans the dialog's full width, so it draws its focus outline inside.
        'has-[>[data-slot=scroll-area-viewport]:focus-visible]:-outline-offset-2',
      )}
      // The 20px padding already clears the scrollbar.
      viewportClassName="overscroll-contain data-has-overflow-y:pe-0"
    >
      <div data-slot="dialog-body" className={cn('px-5 pt-4 pb-1', className)} {...props} />
    </ScrollArea>
  );
}

/** Actions, separated by a divider. Stacked with the main action on top on a phone, in a row from `sm`. */
function DialogFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        'mt-5 flex shrink-0 flex-col-reverse gap-2 border-t border-border px-5 py-4 sm:flex-row sm:justify-end',
        className,
      )}
      {...props}
    />
  );
}

function DialogTitle({ className, ...props }: DialogPrimitive.Title.Props) {
  return <DialogPrimitive.Title data-slot="dialog-title" className={cn('text-title text-balance', className)} {...props} />;
}

function DialogDescription({ className, ...props }: DialogPrimitive.Description.Props) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn('text-small text-pretty text-muted-foreground', className)}
      {...props}
    />
  );
}

export {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogBackdrop,
  DialogPopup,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
  DialogViewport,
  type DialogContentProps,
};
