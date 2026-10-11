'use client';

import { useState, type ReactNode } from 'react';
import { cn } from '@/registry/kosmos/lib/cn';

/**
 * A framed box for an overlay pinned open on a review preview (dialog, drawer, popover, menu...).
 * `transform` makes the box the containing block of every `fixed` descendant, so an overlay portalled
 * into it (`container` on the overlay's Content part) fills the box instead of the page: several
 * overlays sit open side by side, and the iframe on the approval and docs pages measures them.
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
  children,
}: {
  label: string;
  className?: string;
  children: (container: HTMLElement) => ReactNode;
}) {
  const [container, setContainer] = useState<HTMLElement | null>(null);
  return (
    <figure className="flex min-w-0 flex-col gap-2">
      <figcaption className="font-mono text-caption text-muted-foreground">{label}</figcaption>
      <div
        ref={setContainer}
        data-overlay-stage
        className={cn(
          'relative h-[30rem] w-full overflow-hidden rounded-xl border border-transparent bg-background p-4 shadow-inset [transform:translateZ(0)]',
          className,
        )}
      >
        {container ? children(container) : null}
      </div>
    </figure>
  );
}

/** A responsive grid of `OverlayStage`s: one column on a phone, two from `md`. */
export function OverlayStageGrid({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-1 gap-6 md:grid-cols-2">{children}</div>;
}
