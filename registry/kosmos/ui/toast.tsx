'use client';

import { Toast as ToastPrimitive } from '@base-ui/react/toast';
import { CircleAlert, CircleCheck, Info, LoaderCircle, TriangleAlert, X } from 'lucide-react';
import type * as React from 'react';
import { cn } from '@/registry/kosmos/lib/cn';
import { Button } from '@/registry/kosmos/ui/button';

/**
 * The app-wide toast manager. Render one `<Toaster />` in the root layout, then call
 * `toast.add({ title, description, type })` from anywhere, even outside React.
 */
const toast = ToastPrimitive.createToastManager();

/** A separate manager, for a second `Toaster` that must not share toasts with the main one. */
const createToastManager = ToastPrimitive.createToastManager;

/** The toasts and `add`, `update`, `close` and `promise`, inside a `Toaster` or `ToastProvider`. */
const useToastManager = ToastPrimitive.useToastManager;

function ToastProvider(props: ToastPrimitive.Provider.Props) {
  return <ToastPrimitive.Provider {...props} />;
}

function ToastPortal(props: ToastPrimitive.Portal.Props) {
  return <ToastPrimitive.Portal data-slot="toast-portal" {...props} />;
}

/**
 * The landmark the toasts stack in, at the bottom end of the screen (full width on a phone).
 * F6 moves focus into it; hovering or focusing it spreads the stack out.
 */
function ToastViewport({ className, ...props }: ToastPrimitive.Viewport.Props) {
  return (
    <ToastPrimitive.Viewport
      data-slot="toast-viewport"
      className={cn(
        'fixed inset-x-4 bottom-4 z-50 mx-auto sm:start-auto sm:end-4 sm:mx-0 sm:w-[22.5rem]',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
        className,
      )}
      {...props}
    />
  );
}

/**
 * One toast. Collapsed, the newest sits in front and the two before it peek out above it, smaller;
 * hovering or focusing the stack spreads them out. A toast slides up from the bottom edge and leaves
 * the way it came, or the way it was swiped. Under reduced motion the stack stays spread out and
 * toasts only fade in and out.
 */
function Toast({ className, swipeDirection = ['down', 'right'], ...props }: ToastPrimitive.Root.Props) {
  return (
    <ToastPrimitive.Root
      data-slot="toast"
      swipeDirection={swipeDirection}
      className={cn(
        'group/toast absolute inset-x-0 bottom-0 z-[calc(1000-var(--toast-index))] origin-bottom rounded-xl border border-transparent bg-popover text-body text-popover-foreground shadow-popover select-none',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
        // Stack geometry from Base UI's CSS variables: 8px peek and gap, each toast behind 5% smaller.
        '[--gap:0.5rem] [--peek:0.5rem] [--scale:calc(max(0,1-(var(--toast-index)*0.05)))] [--shrink:calc(1-var(--scale))]',
        '[--height:var(--toast-frontmost-height,var(--toast-height))] [--offset-y:calc(var(--toast-offset-y)*-1+var(--toast-index)*var(--gap)*-1+var(--toast-swipe-movement-y))]',
        'h-(--height) [transform:translateX(var(--toast-swipe-movement-x))_translateY(calc(var(--toast-swipe-movement-y)-(var(--toast-index)*var(--peek))-(var(--shrink)*var(--height))))_scale(var(--scale))]',
        'data-expanded:h-(--toast-height) data-expanded:[transform:translateX(var(--toast-swipe-movement-x))_translateY(var(--offset-y))]',
        // Keeps the stack spread out while the pointer crosses the gap between two toasts.
        "after:absolute after:inset-x-0 after:top-full after:h-[calc(var(--gap)+1px)] after:content-['']",
        'transition-[transform,opacity,height] duration-slow data-ending-style:duration-fast',
        'data-starting-style:opacity-0 data-ending-style:opacity-0 data-limited:opacity-0',
        'motion-safe:data-starting-style:[transform:translateY(150%)]',
        'motion-safe:[&[data-ending-style]:not([data-limited]):not([data-swipe-direction])]:[transform:translateY(150%)]',
        'motion-safe:data-ending-style:data-[swipe-direction=down]:[transform:translateY(calc(var(--toast-swipe-movement-y)+150%))]',
        'motion-safe:data-ending-style:data-[swipe-direction=right]:[transform:translateX(calc(var(--toast-swipe-movement-x)+150%))_translateY(var(--offset-y))]',
        'motion-reduce:h-(--toast-height) motion-reduce:transition-[opacity] motion-reduce:[transform:translateX(var(--toast-swipe-movement-x))_translateY(var(--offset-y))]',
        className,
      )}
      {...props}
    />
  );
}

/** Lays out icon, text and buttons. Hides the content of toasts behind the front one while the stack is collapsed. */
function ToastContent({ className, ...props }: ToastPrimitive.Content.Props) {
  return (
    <ToastPrimitive.Content
      data-slot="toast-content"
      className={cn(
        'flex h-full items-start gap-3 overflow-hidden py-3 ps-3.5 pe-3',
        'transition-opacity duration-base motion-safe:data-behind:not-data-expanded:opacity-0',
        className,
      )}
      {...props}
    />
  );
}

/** The toast's title. Without children it shows the `title` passed to `toast.add`. */
function ToastTitle({ className, ...props }: ToastPrimitive.Title.Props) {
  return (
    <ToastPrimitive.Title
      data-slot="toast-title"
      className={cn('text-body font-medium text-pretty wrap-break-word', className)}
      {...props}
    />
  );
}

/** The toast's text. Without children it shows the `description` passed to `toast.add`. */
function ToastDescription({ className, ...props }: ToastPrimitive.Description.Props) {
  return (
    <ToastPrimitive.Description
      data-slot="toast-description"
      className={cn('text-small text-pretty wrap-break-word text-muted-foreground', className)}
      {...props}
    />
  );
}

/** A button for the one follow-up action, such as Undo. Takes `actionProps` from `toast.add`. */
function ToastAction({ className, ...props }: ToastPrimitive.Action.Props) {
  return (
    <ToastPrimitive.Action
      data-slot="toast-action"
      render={<Button variant="secondary" size="sm" />}
      className={cn('shrink-0', className)}
      {...props}
    />
  );
}

/** Closes the toast. Its hit area reaches 6px past the icon. */
function ToastClose({ className, children, ...props }: ToastPrimitive.Close.Props) {
  return (
    <ToastPrimitive.Close
      data-slot="toast-close"
      aria-label="Close notification"
      render={<Button variant="ghost" size="icon-sm" />}
      className={cn('relative -me-1 shrink-0 text-muted-foreground after:absolute after:-inset-1.5', className)}
      {...props}
    >
      {children ?? <X aria-hidden />}
    </ToastPrimitive.Close>
  );
}

/** The icon for a toast's `type`: success, error, warning, info or loading. Renders nothing for other types. */
function ToastIcon({ type, className }: { type: string | undefined; className?: string }) {
  const icons: Record<string, React.ReactNode> = {
    success: <CircleCheck aria-hidden className="text-success" />,
    error: <CircleAlert aria-hidden className="text-destructive" />,
    warning: <TriangleAlert aria-hidden className="text-warning" />,
    info: <Info aria-hidden className="text-muted-foreground" />,
    loading: (
      <LoaderCircle aria-hidden className="text-muted-foreground motion-safe:animate-spin motion-reduce:animate-pulse" />
    ),
  };
  const icon = type ? icons[type] : undefined;
  if (!icon) return null;
  return (
    <span data-slot="toast-icon" className={cn('flex h-5 shrink-0 items-center [&_svg]:size-4', className)}>
      {icon}
    </span>
  );
}

/**
 * Renders every toast of the nearest manager with the default layout. The action sits beside a
 * title on its own, and under the text when there is a description, so the text keeps its width.
 */
function ToastList() {
  const { toasts } = ToastPrimitive.useToastManager();
  return toasts.map((item) => {
    const action = item.actionProps ? <ToastAction /> : null;
    return (
      <Toast key={item.id} toast={item}>
        <ToastContent>
          <ToastIcon type={item.type} />
          <div className="flex min-w-0 flex-1 flex-col items-start gap-0.5">
            <ToastTitle />
            <ToastDescription />
            {item.description && action ? <div className="mt-2">{action}</div> : null}
          </div>
          {item.description ? null : action}
          <ToastClose />
        </ToastContent>
      </Toast>
    );
  });
}

type ToasterProps = ToastPrimitive.Provider.Props & {
  /** The element the toasts render into. Defaults to `document.body`. */
  container?: ToastPrimitive.Portal.Props['container'];
};

/**
 * Provider, portal, viewport and list in one part. Render it once, near the root. It shows the toasts
 * of the app-wide `toast` manager unless `toastManager` says otherwise. Children can call `useToastManager`.
 */
function Toaster({ children, toastManager = toast, container, ...props }: ToasterProps) {
  return (
    <ToastProvider toastManager={toastManager} {...props}>
      {children}
      <ToastPortal container={container}>
        <ToastViewport>
          <ToastList />
        </ToastViewport>
      </ToastPortal>
    </ToastProvider>
  );
}

export {
  Toast,
  ToastAction,
  ToastClose,
  ToastContent,
  ToastDescription,
  ToastIcon,
  ToastList,
  ToastPortal,
  ToastProvider,
  ToastTitle,
  ToastViewport,
  Toaster,
  createToastManager,
  toast,
  useToastManager,
  type ToasterProps,
};
