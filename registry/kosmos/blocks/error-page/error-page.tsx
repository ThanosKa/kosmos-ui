import type * as React from 'react';
import { cn } from '@/registry/kosmos/lib/cn';
import { Button } from '@/registry/kosmos/ui/button';
import { FlickeringGrid } from '@/registry/kosmos/ui/flickering-grid';

// Sample data: replace it with your product's copy and links.
const sampleActions = (
  <>
    <Button variant="primary" size="lg" href="/projects">
      Go to projects
    </Button>
    <Button variant="secondary" size="lg" href="/">
      Back to overview
    </Button>
  </>
);

type ErrorPageProps = Omit<React.ComponentProps<'section'>, 'title'> & {
  /** The status code, shown large above the title: `404`, `500`. */
  code?: React.ReactNode;
  /** A logo or icon above the code. Left out by default. */
  media?: React.ReactNode;
  /** The page's `<h1>`. */
  title?: React.ReactNode;
  /** One or two lines under the title: what happened and what to do. */
  description?: React.ReactNode;
  /** One `primary` and one `secondary` Button at `size="lg"`. `null` leaves them out. */
  actions?: React.ReactNode;
  /** The flickering grid behind the content. */
  grid?: boolean;
};

/**
 * A 404 or 500 page: a large status code, a title, a line and two actions, centered over a flickering grid. It fills
 * its parent and centers itself, so give it the height of the page area. It lays itself out by its own width: the code
 * grows from a 672px-wide container.
 */
function ErrorPage({
  code = '404',
  media,
  title = 'This page doesn’t exist',
  description = 'The link may be out of date or have a typo. Check the address, or go back to your projects.',
  actions = sampleActions,
  grid = true,
  className,
  ...props
}: ErrorPageProps) {
  return (
    <section
      data-slot="error-page"
      className={cn('relative isolate flex flex-1 flex-col overflow-hidden', className)}
      {...props}
    >
      {grid ? <FlickeringGrid spotlight className="mask-[radial-gradient(ellipse_50%_60%_at_50%_50%,black,transparent)]" /> : null}
      <div className="@container flex flex-1 flex-col items-center justify-center px-4 py-16 text-center">
        {media ? <div className="mb-6 flex shrink-0 [&_svg:not([class*='size-'])]:size-10">{media}</div> : null}
        <p className="text-display font-semibold tabular-nums @2xl:text-hero">{code}</p>
        <h1 className="mt-3 max-w-[24em] text-title text-balance wrap-break-word">{title}</h1>
        {description ? (
          <p className="mt-2 max-w-[32em] text-body text-pretty wrap-break-word text-muted-foreground @2xl:text-lead">{description}</p>
        ) : null}
        {actions ? (
          // A label too long for the width wraps inside its button instead of running past the page.
          <div className="mt-8 flex max-w-full flex-wrap justify-center gap-2 *:h-auto *:min-h-9 *:max-w-full *:py-1.5 *:whitespace-normal *:text-balance">
            {actions}
          </div>
        ) : null}
      </div>
    </section>
  );
}

export { ErrorPage, type ErrorPageProps };
