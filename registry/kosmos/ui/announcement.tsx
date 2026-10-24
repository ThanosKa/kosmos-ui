import { mergeProps } from '@base-ui/react/merge-props';
import { useRender } from '@base-ui/react/use-render';
import { ChevronRight } from 'lucide-react';
import type * as React from 'react';
import { cn } from '@/registry/kosmos/lib/cn';

type AnnouncementProps = useRender.ComponentProps<'a'> & {
  /** A short word before the text, such as "New", "Beta" or a version, in a small pill of its own. */
  badge?: React.ReactNode;
};

/**
 * A pill that links to news, such as a release, above a hero or a page title: an optional badge, one short line of
 * muted text and a chevron that nudges toward the link on hover. Text too long for the slot wraps. Renders an `<a>`;
 * pass a router link through `render`.
 */
function Announcement({ badge, className, children, render, ...props }: AnnouncementProps) {
  return useRender({
    defaultTagName: 'a',
    render,
    props: mergeProps<'a'>(
      {
        className: cn(
          // 16px clamps to half the 30px height, so one line is a full pill and wrapped text sits in a rounded box.
          'group/announcement inline-flex min-h-7.5 max-w-full min-w-0 items-center gap-2 rounded-2xl border border-transparent bg-secondary py-0.5 ps-3 pe-3 text-start text-small text-muted-foreground shadow-control [-webkit-tap-highlight-color:transparent]',
          'transition-[background-color,color,scale] hover:bg-muted hover:text-foreground',
          'motion-safe:not-disabled:not-data-disabled:active:scale-96',
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
          badge != null && 'ps-0.5',
          className,
        ),
        children: (
          <>
            {badge != null ? (
              <span
                data-slot="announcement-badge"
                className="block max-w-1/2 shrink-0 truncate rounded-full bg-accent px-2 py-0.75 text-caption font-medium text-foreground"
              >
                {badge}
              </span>
            ) : null}
            <span data-slot="announcement-text" className="min-w-0 py-0.75 text-pretty wrap-break-word">
              {children}
            </span>
            <ChevronRight
              aria-hidden
              className="size-3.5 shrink-0 transition-[translate] rtl:-scale-x-100 motion-safe:ltr:group-hover/announcement:translate-x-0.5 motion-safe:rtl:group-hover/announcement:-translate-x-0.5"
            />
          </>
        ),
      },
      props,
    ),
    state: { slot: 'announcement' },
  });
}

export { Announcement, type AnnouncementProps };
