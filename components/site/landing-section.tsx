import type { ReactNode } from 'react';
import { cn } from '@/registry/kosmos/lib/cn';
import { BlurFade } from '@/registry/kosmos/ui/blur-fade';
import { TextReveal } from '@/registry/kosmos/ui/text-reveal';

/**
 * The space a landing section keeps below itself, which sets the rhythm of the page (kosmos-style, Marketing pages):
 * every section 80px on phones and 112px from 768px; the hero room above it and less below, since the strip under it
 * still belongs to it; the last section before the footer more.
 */
const rhythm = {
  hero: 'pt-16 pb-10 md:pt-24 md:pb-12',
  section: 'pb-20 md:pb-28',
  last: 'pb-28 md:pb-40',
} as const;

/** The column a section's content keeps to: `wide` for a showcase that breaks out of the text column. */
const columns = {
  default: 'max-w-5xl',
  wide: 'max-w-6xl',
} as const;

/** The wait between a section's title and its content, in milliseconds: one chunk step. */
const chunkStep = 100;

/**
 * One section of the landing page. The landing is an ordered list of these, top to bottom. A section with a `title`
 * reveals it word by word as it scrolls into view and brings its content in 100ms later; a section built from a block
 * that has its own title blurs in as a whole. The hero plays on its own.
 */
export type LandingSectionProps = {
  /** A stable name for the section, its `data-landing-section`. */
  id: string;
  /** The section's heading, for a section whose content brings none. At most two short lines. */
  title?: string;
  /** A heading for screen readers, for a section with neither a title nor a heading of its own. */
  srHeading?: string;
  /** The space around the section: `hero` at the top of the page, `last` before the footer. */
  space?: keyof typeof rhythm;
  column?: keyof typeof columns;
  className?: string;
  children: ReactNode;
};

export function LandingSection({ id, title, srHeading, space = 'section', column = 'default', className, children }: LandingSectionProps) {
  const headingId = `landing-${id}`;
  return (
    <section
      data-landing-section={id}
      aria-labelledby={title || srHeading ? headingId : undefined}
      className={cn('px-4 sm:px-6', rhythm[space], className)}
    >
      <div className={cn('mx-auto flex w-full flex-col gap-8', columns[column])}>
        {srHeading ? (
          <h2 id={headingId} className="sr-only">
            {srHeading}
          </h2>
        ) : null}
        {space === 'hero' ? (
          children
        ) : title ? (
          <>
            <LandingTitle id={headingId}>{title}</LandingTitle>
            <BlurFade delay={chunkStep}>{children}</BlurFade>
          </>
        ) : (
          <BlurFade>{children}</BlurFade>
        )}
      </div>
    </section>
  );
}

/**
 * The title of a section built from blocks that bring no title of their own, set like the title of a marketing
 * block: centered, `text-heading` growing to `text-display` from a 672px-wide container.
 */
export function LandingTitle({ id, children }: { id: string; children: string }) {
  return (
    <div className="@container flex justify-center">
      <h2 id={id} className="max-w-[20em] text-center text-heading font-semibold text-balance text-foreground @2xl:text-display">
        <TextReveal trigger="view">{children}</TextReveal>
      </h2>
    </div>
  );
}
