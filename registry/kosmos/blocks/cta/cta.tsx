import type * as React from 'react';
import { cn } from '@/registry/kosmos/lib/cn';
import { Button } from '@/registry/kosmos/ui/button';

// Sample data: replace it with your product's title and link.
const sampleTitle = (
  <>
    Add your first project,
    <br />
    see events in a minute
  </>
);
const sampleAction = (
  <Button variant="primary" size="lg" href="/signup">
    Start for free
  </Button>
);

type CtaProps = Omit<React.ComponentProps<'section'>, 'title'> & {
  /** The heading, two short lines: put a `<br />` where the first ends. */
  title?: React.ReactNode;
  /** One line under the title. Most closing sections go without. */
  description?: React.ReactNode;
  /** The one link under the title, a `primary` Button. `null` leaves it out. */
  action?: React.ReactNode;
  /** The title is an `<h2>`; pass 3 for a section nested one level deeper. */
  headingLevel?: 2 | 3;
};

/**
 * The closing section of a marketing page: a two-line title and one action, centered, with room around them. Lays
 * itself out by its own width: the title grows to the section role from a 672px-wide container.
 */
function Cta({ title = sampleTitle, description, action = sampleAction, headingLevel = 2, className, ...props }: CtaProps) {
  const Heading = headingLevel === 2 ? 'h2' : 'h3';
  return (
    <section
      data-slot="cta"
      className={cn('@container flex flex-col items-center px-4 py-16 text-center @2xl:px-6 @2xl:py-28', className)}
      {...props}
    >
      <Heading className="max-w-[20em] text-heading font-semibold text-balance wrap-break-word text-foreground @2xl:text-display">{title}</Heading>
      {description ? (
        <p data-slot="cta-description" className="mt-3 max-w-[38em] text-body text-pretty text-muted-foreground @2xl:text-lead">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-8 flex flex-wrap justify-center gap-3">{action}</div> : null}
    </section>
  );
}

export { Cta, type CtaProps };
