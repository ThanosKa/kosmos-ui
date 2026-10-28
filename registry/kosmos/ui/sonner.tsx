'use client';

import { CircleAlert, CircleCheck, Info, LoaderCircle, TriangleAlert, X } from 'lucide-react';
import * as React from 'react';
import { Toaster as Sonner, type ToastClassnames, type ToasterProps as SonnerProps } from 'sonner';
import { cn } from '@/registry/kosmos/lib/cn';
import { buttonVariants } from '@/registry/kosmos/ui/button';

// Sonner injects its CSS unlayered, so it beats Tailwind's layered utilities on the properties it sets on every toast
// and its children (transition, outline, focus shadow). The `!` utilities win those back.
const buttonTransition = 'transition-[background-color,scale]!';

const classNames: ToastClassnames = {
  toast: cn(
    'flex w-(--width) items-start gap-x-3 gap-y-2 rounded-xl border border-transparent bg-popover py-3 ps-3.5 pe-3 font-sans text-body text-popover-foreground shadow-popover select-none',
    'focus-visible:shadow-popover! focus-visible:outline-2! focus-visible:outline-offset-2 focus-visible:outline-ring!',
    // With a description, the buttons move under the text, lined up with it, so the text keeps its width.
    '[&:has([data-description])]:flex-wrap [&:has([data-description])>[data-content]]:basis-[calc(100%-4rem)]',
    '[&:has([data-description])>[data-close-button]]:order-1 [&:has([data-description])>[data-button]]:order-2',
    '[&:has([data-description]):has(>[data-icon])>[data-cancel]]:ms-7',
    '[&:has([data-description]):has(>[data-icon]):not(:has(>[data-cancel]))>[data-action]]:ms-7',
    // Hides the content of the toasts behind the front one while the stack is collapsed.
    '[&[data-expanded=false][data-front=false]>*]:opacity-0',
    // Sonner turns every transition off under reduced motion; Kosmos keeps the fade.
    'motion-reduce:transition-opacity!',
  ),
  icon: 'relative flex h-5 w-4 shrink-0 items-center [&_svg]:size-4',
  content: 'flex min-w-0 flex-1 flex-col gap-0.5',
  title: 'text-body font-medium text-pretty wrap-break-word',
  description: 'text-small text-pretty wrap-break-word text-muted-foreground',
  actionButton: cn(buttonVariants({ variant: 'secondary', size: 'sm' }), 'self-center', buttonTransition),
  cancelButton: cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'self-center', buttonTransition),
  // Sonner always sets `data-disabled` on the close button, which Button's disabled look would match, so it is styled here.
  closeButton: cn(
    'relative order-last -me-1 inline-flex size-6 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground [&_svg]:size-3.5',
    'focus-visible:outline-2! focus-visible:outline-offset-2 focus-visible:outline-ring! after:absolute after:-inset-1.5',
    'transition-[background-color,color]!',
  ),
};

const icons: SonnerProps['icons'] = {
  success: <CircleCheck aria-hidden className="text-success" />,
  error: <CircleAlert aria-hidden className="text-destructive" />,
  warning: <TriangleAlert aria-hidden className="text-warning" />,
  info: <Info aria-hidden className="text-muted-foreground" />,
  loading: <LoaderCircle aria-hidden className="text-muted-foreground motion-safe:animate-spin" />,
  close: <X aria-hidden />,
};

/**
 * The default Toasters in mount order. Sonner shows every toast in every Toaster, so only the first one mounted
 * without an `id` shows them: a page that mounts two by mistake, such as a layout and a page, never doubles a toast.
 */
let mounted: symbol[] = [];
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function useFirstMounted(enabled: boolean) {
  const [key] = React.useState(() => Symbol('toaster'));
  React.useEffect(() => {
    if (!enabled) return;
    mounted = [...mounted, key];
    listeners.forEach((listener) => listener());
    return () => {
      mounted = mounted.filter((entry) => entry !== key);
      listeners.forEach((listener) => listener());
    };
  }, [enabled, key]);
  return React.useSyncExternalStore(
    subscribe,
    () => !enabled || mounted[0] === key,
    () => !enabled,
  );
}

type ToasterProps = Omit<SonnerProps, 'theme' | 'richColors'>;

/**
 * Sonner's toaster in the Kosmos look: the popover surface, status color on the icon only, Kosmos buttons, and a close
 * button on every toast. Render it once near the root, then call `toast()` from `sonner` anywhere.
 */
function Toaster({ toastOptions, style, id, ...props }: ToasterProps) {
  const shown = useFirstMounted(id === undefined);
  if (!shown) return null;
  return (
    <Sonner
      id={id}
      gap={8}
      offset={16}
      mobileOffset={16}
      closeButton
      icons={icons}
      style={{ '--width': '22.5rem', ...style } as React.CSSProperties}
      toastOptions={{
        unstyled: true,
        closeButtonAriaLabel: 'Close notification',
        ...toastOptions,
        classNames: { ...classNames, ...toastOptions?.classNames },
      }}
      {...props}
    />
  );
}

export { Toaster, type ToasterProps };
