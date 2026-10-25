import type { ReactNode } from 'react';
import { cn } from '@/registry/kosmos/lib/cn';
import { BlurFade } from '@/registry/kosmos/ui/blur-fade';

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

/**
 * One section of the landing page. The landing is an ordered list of these, top to bottom, each built from Kosmos
 * blocks. Every section but the hero comes in once, blurring into view as it scrolls on screen.
 */
export type LandingSectionProps = {
  /** A stable name for the section, its `data-landing-section`. */
  id: string;
  /** A heading for screen readers, for a section whose content has none of its own. */
  srHeading?: string;
  /** The `id` of the section's own visible heading, which names it. */
  labelledBy?: string;
  /** The space around the section: `hero` at the top of the page, `last` before the footer. */
  space?: keyof typeof rhythm;
  column?: keyof typeof columns;
  /** Drawn behind the whole section, full width: a `FlickeringGrid`, say. */
  background?: ReactNode;
  className?: string;
  children: ReactNode;
};

export function LandingSection({
  id,
  srHeading,
  labelledBy,
  space = 'section',
  column = 'default',
  background,
  className,
  children,
}: LandingSectionProps) {
  const headingId = `landing-${id}`;
  return (
    <section
      data-landing-section={id}
      aria-labelledby={srHeading ? headingId : labelledBy}
      className={cn('px-4 sm:px-6', background && 'relative isolate overflow-hidden', rhythm[space], className)}
    >
      {background}
      <div className={cn('mx-auto flex w-full flex-col gap-8', columns[column])}>
        {srHeading ? (
          <h2 id={headingId} className="sr-only">
            {srHeading}
          </h2>
        ) : null}
        {space === 'hero' ? children : <BlurFade className="flex flex-col gap-8">{children}</BlurFade>}
      </div>
    </section>
  );
}

/**
 * The title of a section built from blocks that bring no title of their own, set like the title of a marketing
 * block: centered, `text-heading` growing to `text-display` from a 672px-wide container.
 */
export function LandingTitle({ id, children }: { id: string; children: ReactNode }) {
  return (
    <div className="@container flex justify-center">
      <h2 id={id} className="max-w-[20em] text-center text-heading font-semibold text-balance text-foreground @2xl:text-display">
        {children}
      </h2>
    </div>
  );
}
