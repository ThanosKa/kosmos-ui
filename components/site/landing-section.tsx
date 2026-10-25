import { Blocks } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { readRegistryItems } from '@/lib/registry';
import { cn } from '@/registry/kosmos/lib/cn';

/**
 * The space a landing section keeps below itself, which sets the rhythm of the page (kosmos-style, Marketing pages):
 * every section 80px on phones and 112px from 768px; the hero room above it and less below, since the strip under it
 * still belongs to it; the last section before the footer more.
 */
const rhythm = {
  hero: 'pt-16 pb-16 md:pt-24 md:pb-20',
  section: 'pb-20 md:pb-28',
  last: 'pb-28 md:pb-40',
} as const;

/** The column a section's content keeps to: `wide` for a showcase that breaks out of the text column. */
const columns = {
  default: 'max-w-5xl',
  wide: 'max-w-6xl',
} as const;

/**
 * One section of the landing page. The landing is an ordered list of these, top to bottom, each a Kosmos block and
 * labelled with it: `blocks` names their registry items, and the label links each one to the variant on its block
 * category page. `components` names the components a section is built from beside its blocks.
 */
export type LandingSectionProps = {
  /** A stable name for the section, its `data-landing-section`. */
  id: string;
  /** The registry names of the blocks the section is built from, in the order the label lists them. */
  blocks?: string[];
  /** The registry names of the components the section is built from, listed after its blocks. */
  components?: string[];
  /** A heading for screen readers, for a section whose content has none of its own. */
  srHeading?: string;
  /** The `id` of the section's own visible heading, which names it. */
  labelledBy?: string;
  /** The space around the section: `hero` at the top of the page, `last` before the footer. */
  space?: keyof typeof rhythm;
  column?: keyof typeof columns;
  className?: string;
  children: ReactNode;
};

const labelLink =
  'rounded-sm font-medium text-foreground underline decoration-muted-foreground/50 underline-offset-4 transition-[text-decoration-color] hover:decoration-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring';

/** "Built with" and a link to each block, then each component, in the order given. Throws on a name the registry lacks. */
export function BlockLabel({ blocks = [], components = [] }: { blocks?: string[]; components?: string[] }) {
  const items = readRegistryItems();
  const find = (name: string, type: string) => {
    const item = items.find((candidate) => candidate.name === name && candidate.type === type);
    if (!item) throw new Error(`Landing section names "${name}", which is no ${type} item`);
    return item;
  };
  const links = [
    ...blocks.map((name) => {
      const item = find(name, 'registry:block');
      if (!item.categories?.[0]) throw new Error(`Landing section names "${name}", which has no block category`);
      return { name, title: item.title ?? name, href: `/docs/blocks/${item.categories[0]}#${name}` };
    }),
    ...components.map((name) => ({ name, title: find(name, 'registry:ui').title ?? name, href: `/docs/components/${name}` })),
  ];
  if (links.length === 0) throw new Error('A landing section names the blocks or components it is built from');
  return (
    <p data-block-label className="flex flex-wrap items-center justify-center gap-x-1.5 gap-y-1 text-caption text-muted-foreground">
      <Blocks aria-hidden className="size-3.5 shrink-0" />
      <span>Built with</span>
      {links.map((link, index) => (
        <span key={link.name}>
          <Link href={link.href} className={labelLink}>
            {link.title}
          </Link>
          {index < links.length - 1 ? ',' : null}
        </span>
      ))}
    </p>
  );
}

export function LandingSection({
  id,
  blocks = [],
  components = [],
  srHeading,
  labelledBy,
  space = 'section',
  column = 'default',
  className,
  children,
}: LandingSectionProps) {
  const headingId = `landing-${id}`;
  return (
    <section data-landing-section={id} aria-labelledby={srHeading ? headingId : labelledBy} className={cn('px-4 sm:px-6', rhythm[space], className)}>
      <div className={cn('mx-auto flex w-full flex-col gap-8', columns[column])}>
        {srHeading ? (
          <h2 id={headingId} className="sr-only">
            {srHeading}
          </h2>
        ) : null}
        {children}
        <BlockLabel blocks={blocks} components={components} />
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
