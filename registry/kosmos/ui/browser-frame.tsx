import { cva, type VariantProps } from 'class-variance-authority';
import type * as React from 'react';
import { cn } from '@/registry/kosmos/lib/cn';

const browserFrame = cva('', {
  variants: {
    tilt: {
      false: '',
      true: 'motion-safe:rotate-x-6 motion-safe:transition-[transform] motion-safe:duration-slow motion-safe:ease-power3-out motion-safe:group-hover/frame:rotate-x-0',
    },
  },
  defaultVariants: { tilt: false },
});

type BrowserFrameProps = Omit<React.ComponentProps<'div'>, 'title'> &
  VariantProps<typeof browserFrame> & {
    /** The address in the bar, without a scheme. Leave it out for a bar with only the dots. */
    url?: string;
  };

/**
 * A browser window around a screenshot or a live screen: a bar with three neutral dots and an optional address, then
 * the content. With `tilt` the window leans back in perspective and stands straight when the pointer is over it; under
 * reduced motion it stands straight. The bar is decorative and hidden from assistive technology.
 */
function BrowserFrame({ url, tilt = false, className, children, ...props }: BrowserFrameProps) {
  return (
    <div data-slot="browser-frame" className={cn(tilt && 'group/frame perspective-distant', className)} {...props}>
      <div className={cn('overflow-hidden rounded-2xl border border-transparent bg-card shadow-card', browserFrame({ tilt }))}>
        <div
          data-slot="browser-frame-bar"
          aria-hidden
          className="grid h-9 grid-cols-[1fr_minmax(0,20rem)_1fr] items-center gap-3 border-b border-border px-3.5"
        >
          <span className="flex gap-1.5">
            <span className="size-2.5 rounded-full bg-foreground/15" />
            <span className="size-2.5 rounded-full bg-foreground/15" />
            <span className="size-2.5 rounded-full bg-foreground/15" />
          </span>
          {url ? (
            <span className="truncate rounded-full bg-muted px-3 py-0.5 text-center text-caption text-muted-foreground shadow-inset">{url}</span>
          ) : null}
        </div>
        <div data-slot="browser-frame-content" className="bg-background">
          {children}
        </div>
      </div>
    </div>
  );
}

export { BrowserFrame, type BrowserFrameProps };
