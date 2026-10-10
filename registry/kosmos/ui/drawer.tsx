'use client';

import { Drawer as DrawerPrimitive } from '@base-ui/react/drawer';
import { XIcon } from 'lucide-react';
import * as React from 'react';
import { cn } from '@/registry/kosmos/lib/cn';
import { Button } from '@/registry/kosmos/ui/button';

/**
 * A panel that slides in from an edge and follows a swipe toward that edge to close.
 * `swipeDirection` picks the edge: `right` (default) and `left` for side panels, `down` for a
 * bottom sheet, `up` for a top sheet.
 */
const DrawerModalContext = React.createContext<DrawerPrimitive.Root.Props['modal']>(true);

function Drawer({ swipeDirection = 'right', modal = true, ...props }: DrawerPrimitive.Root.Props) {
  return (
    <DrawerModalContext.Provider value={modal}>
      <DrawerPrimitive.Root data-slot="drawer" swipeDirection={swipeDirection} modal={modal} {...props} />
    </DrawerModalContext.Provider>
  );
}

function DrawerTrigger(props: DrawerPrimitive.Trigger.Props) {
  return <DrawerPrimitive.Trigger data-slot="drawer-trigger" {...props} />;
}

function DrawerPortal(props: DrawerPrimitive.Portal.Props) {
  return <DrawerPrimitive.Portal data-slot="drawer-portal" {...props} />;
}

function DrawerClose(props: DrawerPrimitive.Close.Props) {
  return <DrawerPrimitive.Close data-slot="drawer-close" {...props} />;
}

/** The scrim behind a modal drawer. Fades out as the drawer is swiped away. */
function DrawerOverlay({ className, ...props }: DrawerPrimitive.Backdrop.Props) {
  return (
    <DrawerPrimitive.Backdrop
      data-slot="drawer-overlay"
      className={cn(
        'fixed inset-0 z-50 bg-scrim opacity-[calc(1-var(--drawer-swipe-progress,0))] supports-[-webkit-touch-callout:none]:absolute',
        'transition-opacity duration-slow data-starting-style:opacity-0 data-ending-style:opacity-0 data-ending-style:duration-fast data-swiping:duration-0',
        className,
      )}
      {...props}
    />
  );
}

/** The full-screen layer the popup sits in. Lets clicks through to the page when the drawer is not modal. */
function DrawerViewport({ className, ...props }: DrawerPrimitive.Viewport.Props) {
  return (
    <DrawerPrimitive.Viewport
      data-slot="drawer-viewport"
      className={cn('pointer-events-none fixed inset-0 z-50', className)}
      {...props}
    />
  );
}

/**
 * The drawer surface, placed on the edge its `swipeDirection` names. Side panels float 8px from the
 * screen edges; sheets sit flush on the bottom or top edge with `rounded-3xl` corners on the open side.
 * Swipes move it with the pointer; open and close slide it, or cross-fade under reduced motion.
 */
function DrawerPopup({ className, ...props }: DrawerPrimitive.Popup.Props) {
  return (
    <DrawerPrimitive.Popup
      data-slot="drawer-popup"
      className={cn(
        'group/drawer pointer-events-auto fixed flex min-h-0 flex-col border border-transparent bg-popover text-body text-popover-foreground shadow-modal',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
        // Side panels.
        'data-[swipe-direction=left]:inset-y-2 data-[swipe-direction=left]:left-2 data-[swipe-direction=right]:inset-y-2 data-[swipe-direction=right]:right-2',
        'data-[swipe-direction=left]:w-[calc(100%-1rem)] data-[swipe-direction=right]:w-[calc(100%-1rem)] sm:data-[swipe-direction=left]:w-96 sm:data-[swipe-direction=right]:w-96',
        'data-[swipe-direction=left]:rounded-xl data-[swipe-direction=right]:rounded-xl',
        // Sheets.
        'data-[swipe-direction=down]:inset-x-0 data-[swipe-direction=down]:bottom-0 data-[swipe-direction=down]:rounded-t-3xl',
        'data-[swipe-direction=up]:inset-x-0 data-[swipe-direction=up]:top-0 data-[swipe-direction=up]:rounded-b-3xl',
        'data-[swipe-direction=down]:max-h-[calc(100%-3rem)] data-[swipe-direction=up]:max-h-[calc(100%-3rem)]',
        'data-[swipe-direction=down]:pb-[env(safe-area-inset-bottom)]',
        // Swipe: follow the pointer. Snap points offset a bottom sheet.
        '[transform:translate3d(var(--drawer-swipe-movement-x,0px),calc(var(--drawer-snap-point-offset,0px)+var(--drawer-swipe-movement-y,0px)),0)] data-swiping:select-none',
        // Where the panel starts and ends: just past its edge.
        'data-[swipe-direction=right]:[--drawer-closed:translate3d(calc(100%+0.5rem+2px),0,0)] data-[swipe-direction=left]:[--drawer-closed:translate3d(calc(-100%-0.5rem-2px),0,0)]',
        'data-[swipe-direction=down]:[--drawer-closed:translate3d(0,calc(100%+2px),0)] data-[swipe-direction=up]:[--drawer-closed:translate3d(0,calc(-100%-2px),0)]',
        // Open and close: slide, or cross-fade under reduced motion.
        'transition-[transform,opacity] duration-slow data-ending-style:duration-fast data-swiping:duration-0',
        'motion-safe:data-starting-style:[transform:var(--drawer-closed)] motion-safe:data-ending-style:[transform:var(--drawer-closed)]',
        'motion-reduce:data-starting-style:opacity-0 motion-reduce:data-ending-style:opacity-0',
        className,
      )}
      {...props}
    />
  );
}

type DrawerContentProps = DrawerPrimitive.Popup.Props & {
  /** Shows a close button in the top corner. Turn it off only when the footer has a way out. */
  showCloseButton?: boolean;
  /** The element the drawer renders into. Defaults to `document.body`. */
  container?: DrawerPrimitive.Portal.Props['container'];
};

/**
 * Portal, overlay, viewport and popup in one part, with a close button in the top corner and a
 * grab handle on sheets. The overlay is left out when the drawer is not modal.
 */
function DrawerContent({ className, children, showCloseButton = true, container, ...props }: DrawerContentProps) {
  const modal = React.useContext(DrawerModalContext);
  return (
    <DrawerPortal container={container}>
      {modal === true ? <DrawerOverlay /> : null}
      <DrawerViewport>
        <DrawerPopup data-slot="drawer-content" className={className} {...props}>
          <div
            aria-hidden
            data-slot="drawer-handle"
            className="hidden shrink-0 justify-center pt-2 group-data-[swipe-direction=down]/drawer:flex group-data-[swipe-direction=up]/drawer:order-last group-data-[swipe-direction=up]/drawer:flex group-data-[swipe-direction=up]/drawer:pt-0 group-data-[swipe-direction=up]/drawer:pb-2"
          >
            <div className="h-1 w-9 rounded-full bg-muted-foreground/30" />
          </div>
          <DrawerPrimitive.Content
            data-slot="drawer-inner"
            className="relative flex min-h-0 flex-1 flex-col group-data-swiping/drawer:select-none"
          >
            {children}
            {showCloseButton ? (
              <DrawerPrimitive.Close
                data-slot="drawer-close"
                aria-label="Close"
                render={
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="absolute end-4 top-5 text-muted-foreground group-data-[swipe-direction=down]/drawer:top-3"
                  />
                }
              >
                <XIcon aria-hidden />
              </DrawerPrimitive.Close>
            ) : null}
          </DrawerPrimitive.Content>
        </DrawerPopup>
      </DrawerViewport>
    </DrawerPortal>
  );
}

/** Title and description. Leaves room on the end side for the close button. */
function DrawerHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="drawer-header"
      className={cn(
        'flex shrink-0 flex-col gap-1 px-5 pt-5 pe-12 group-data-[swipe-direction=down]/drawer:pt-3',
        className,
      )}
      {...props}
    />
  );
}

/** The content between header and footer. Scrolls on its own, so header and footer stay in view. */
function DrawerBody({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="drawer-body"
      className={cn('min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pt-4 pb-5', className)}
      {...props}
    />
  );
}

/** Actions at the bottom edge, separated by a divider. */
function DrawerFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="drawer-footer"
      className={cn(
        'mt-auto flex shrink-0 flex-col-reverse gap-2 border-t border-border px-5 py-4 sm:flex-row sm:justify-end',
        'group-data-[swipe-direction=down]/drawer:[[data-slot=drawer-header]+&]:mt-5 group-data-[swipe-direction=up]/drawer:[[data-slot=drawer-header]+&]:mt-5',
        className,
      )}
      {...props}
    />
  );
}

function DrawerTitle({ className, ...props }: DrawerPrimitive.Title.Props) {
  return <DrawerPrimitive.Title data-slot="drawer-title" className={cn('text-title', className)} {...props} />;
}

function DrawerDescription({ className, ...props }: DrawerPrimitive.Description.Props) {
  return (
    <DrawerPrimitive.Description
      data-slot="drawer-description"
      className={cn('text-small text-pretty text-muted-foreground', className)}
      {...props}
    />
  );
}

export {
  Drawer,
  DrawerBody,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerPopup,
  DrawerPortal,
  DrawerTitle,
  DrawerTrigger,
  DrawerViewport,
  type DrawerContentProps,
};
