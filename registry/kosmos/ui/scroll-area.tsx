'use client';

import { ScrollArea as ScrollAreaPrimitive } from '@base-ui/react/scroll-area';
import * as React from 'react';
import { cn } from '@/registry/kosmos/lib/cn';

/**
 * True inside a ScrollArea's content. Code written for shadcn's ScrollArea passes
 * `<ScrollBar orientation="horizontal" />` as a child; ScrollArea already renders that scrollbar
 * outside the viewport (where the edge fade cannot reach it), so the child renders nothing.
 */
const InsideViewport = React.createContext(false);

type ScrollAreaProps = ScrollAreaPrimitive.Root.Props & {
  /** Fade out each edge that has hidden content past it. On by default. */
  fade?: boolean;
  /**
   * Lets the element that scrolls take keyboard focus while it overflows, so arrow keys scroll it. On by default.
   * Turn it off when every item inside takes focus and scrolls itself into view (a menu, a tab list).
   */
  focusable?: boolean;
  /** Classes for the element that scrolls. */
  viewportClassName?: string;
  /** A ref to the element that scrolls, to read or set its scroll position. */
  viewportRef?: React.Ref<HTMLDivElement>;
};

/**
 * A native scroll container with a thin scrollbar that looks the same on every platform. Size it
 * with `className` (`h-72`, `max-h-80`). While content is hidden past an edge, that edge fades out
 * and the scrollbar shows, so the overflow never goes unnoticed. Both scrollbars are built in and
 * show only on the axis that overflows.
 */
function ScrollArea({
  className,
  children,
  fade = true,
  focusable = true,
  viewportClassName,
  viewportRef,
  ...props
}: ScrollAreaProps) {
  return (
    <ScrollAreaPrimitive.Root
      data-slot="scroll-area"
      className={cn(
        'relative flex min-h-0 flex-col rounded-lg',
        // The viewport takes keyboard focus while it scrolls. Its edge mask would clip its own outline, so the root draws it.
        'has-[>[data-slot=scroll-area-viewport]:focus-visible]:outline-2 has-[>[data-slot=scroll-area-viewport]:focus-visible]:outline-offset-2 has-[>[data-slot=scroll-area-viewport]:focus-visible]:outline-ring',
        className,
      )}
      {...props}
    >
      <ScrollAreaPrimitive.Viewport
        ref={viewportRef}
        data-slot="scroll-area-viewport"
        {...(focusable ? null : { tabIndex: -1 })}
        className={cn(
          // `relative` keeps absolutely positioned content (an `sr-only` label) inside the clip, so it never widens the page.
          'relative min-h-0 flex-auto overscroll-x-contain rounded-[inherit] outline-none',
          // Room for the scrollbar, so it never covers content.
          'data-has-overflow-x:pb-3 data-has-overflow-y:pe-3',
          fade && [
            'mask-t-from-[calc(100%-min(2rem,var(--scroll-area-overflow-y-start)))] mask-b-from-[calc(100%-min(2rem,var(--scroll-area-overflow-y-end)))]',
            'mask-l-from-[calc(100%-min(2rem,var(--scroll-area-overflow-x-start)))] mask-r-from-[calc(100%-min(2rem,var(--scroll-area-overflow-x-end)))]',
            // The overflow edges are logical: in right-to-left text the start is on the right.
            'rtl:mask-l-from-[calc(100%-min(2rem,var(--scroll-area-overflow-x-end)))] rtl:mask-r-from-[calc(100%-min(2rem,var(--scroll-area-overflow-x-start)))]',
          ],
          viewportClassName,
        )}
      >
        <ScrollAreaPrimitive.Content data-slot="scroll-area-content">
          <InsideViewport value>{children}</InsideViewport>
        </ScrollAreaPrimitive.Content>
      </ScrollAreaPrimitive.Viewport>
      <ScrollBar orientation="vertical" />
      <ScrollBar orientation="horizontal" />
      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  );
}

/**
 * A 6px scrollbar that shows only while its axis overflows. The thumb can be dragged and the track
 * clicked; the hit area reaches 4px past the bar on each side. ScrollArea renders both of its own,
 * so this is only for a scroll area built from the Base UI parts.
 */
function ScrollBar({ className, orientation = 'vertical', ...props }: ScrollAreaPrimitive.Scrollbar.Props) {
  const insideViewport = React.use(InsideViewport);
  if (insideViewport) return null;
  return (
    <ScrollAreaPrimitive.Scrollbar
      data-slot="scroll-area-scrollbar"
      orientation={orientation}
      className={cn(
        'm-1 flex touch-none rounded-full bg-muted select-none',
        "before:absolute before:-inset-1 before:content-['']",
        orientation === 'vertical' ? 'w-1.5' : 'h-1.5',
        className,
      )}
      {...props}
    >
      <ScrollAreaPrimitive.Thumb
        data-slot="scroll-area-thumb"
        className={cn(
          // Solid, so the thumb keeps 3:1 against the track in both themes.
          'rounded-full bg-scrollbar-thumb',
          orientation === 'vertical' ? 'h-(--scroll-area-thumb-height) w-full' : 'h-full w-(--scroll-area-thumb-width)',
        )}
      />
    </ScrollAreaPrimitive.Scrollbar>
  );
}

export { ScrollArea, ScrollBar, type ScrollAreaProps };
