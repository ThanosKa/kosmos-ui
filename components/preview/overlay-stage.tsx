'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { cn } from '@/registry/kosmos/lib/cn';

function useIsInView(element: HTMLElement | null) {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    if (!element) return;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.intersectionRatio >= 0.75 || entry.intersectionRect.height >= window.innerHeight * 0.9),
      { threshold: Array.from({ length: 21 }, (_, step) => step / 20) },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [element]);
  return inView;
}

/**
 * A framed box for an overlay pinned open for a thumbnail (dialog, drawer, popover, menu...).
 * `transform` makes the box the containing block of every `fixed` descendant, so an overlay portalled
 * into it (`container` on the overlay's Content part) fills the box instead of the page: several
 * overlays sit open side by side, and the iframe on the approval and docs pages measures them.
 *
 * Pass `inert` when the pinned overlay is a picture, not the thing under review: several open menus on one page trap focus in a guard loop.
 *
 * Pass `whileVisible` for an overlay the browser places against the viewport (popover, hover card, tooltip): out of view
 * its room is the part of the stage that is on screen, which is none, so it lands outside the stage. The overlay renders
 * only while most of the stage is on screen.
 *
 * Render the overlay with controlled `open`, `modal={false}` (no focus trap or scroll lock shared
 * between several open overlays) and `initialFocus={false}` (the page must not scroll to the last one):
 *
 * ```tsx
 * <OverlayStage label="open">
 *   {(container) => (
 *     <Dialog open modal={false}>
 *       <DialogContent container={container} initialFocus={false}>...</DialogContent>
 *     </Dialog>
 *   )}
 * </OverlayStage>
 * ```
 */
export function OverlayStage({
  label,
  className,
  inert,
  whileVisible,
  children,
}: {
  label: string;
  className?: string;
  inert?: boolean;
  whileVisible?: boolean;
  children: (container: HTMLElement) => ReactNode;
}) {
  const [container, setContainer] = useState<HTMLElement | null>(null);
  const visible = useIsInView(whileVisible ? container : null);
  return (
    <figure className="flex min-w-0 flex-col gap-2">
      <figcaption className="font-mono text-caption text-muted-foreground">{label}</figcaption>
      <div
        ref={setContainer}
        data-overlay-stage
        inert={inert}
        className={cn(
          // Base UI's focus guards sit in the stage's corner; one that takes focus must not draw a ring the stage clips.
          'relative h-[30rem] w-full overflow-hidden rounded-xl border border-transparent bg-background p-4 shadow-inset [transform:translateZ(0)] [&_[data-base-ui-focus-guard]]:outline-none',
          className,
        )}
      >
        {container && (!whileVisible || visible) ? children(container) : null}
      </div>
    </figure>
  );
}

/**
 * An `OverlayStage` with no label, frame, fill or scrim, for a thumbnail (`<name>-thumb.tsx`): the overlay pinned
 * open inside it is all the shot shows. The same `transform` holds its `fixed` overlays; render them as in an `OverlayStage`.
 */
export function ThumbStage({
  className,
  children,
}: {
  className?: string;
  children: (container: HTMLElement) => ReactNode;
}) {
  const [container, setContainer] = useState<HTMLElement | null>(null);
  return (
    <div
      ref={setContainer}
      data-overlay-stage
      className={cn('relative w-full [transform:translateZ(0)] [&_[data-slot$=backdrop]]:hidden', className)}
    >
      {container ? children(container) : null}
    </div>
  );
}

/** A responsive grid of `OverlayStage`s: one column on a phone, two from `md`. */
export function OverlayStageGrid({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-1 gap-6 md:grid-cols-2">{children}</div>;
}
