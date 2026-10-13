import { Blocks } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { readRegistryItems } from '@/lib/registry';
import { cn } from '@/registry/kosmos/lib/cn';

/**
 * One section of the landing page. The landing is an ordered list of these, top to bottom, each built from Kosmos
 * blocks and labelled with them: `blocks` names their registry items, and the label links each one to the variant
 * on its block category page. A section no block covers yet names the components it is built from instead.
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
  /** `div` for a section that holds a landmark of its own, such as the page footer, which a `<section>` would scope. */
  as?: 'section' | 'div';
  className?: string;
  children: ReactNode;
};

const labelLink =
  'rounded-sm font-medium text-foreground underline decoration-muted-foreground/50 underline-offset-4 transition-[text-decoration-color] hover:decoration-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring';

/** "Built with" and a link to each block, then each component, in the order given. Throws on a name the registry lacks. */
function BlockLabel({ blocks, components }: { blocks: string[]; components: string[] }) {
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

export function LandingSection({ id, blocks = [], components = [], srHeading, labelledBy, as: Element = 'section', className, children }: LandingSectionProps) {
  const headingId = `landing-${id}`;
  return (
    <Element data-landing-section={id} aria-labelledby={srHeading ? headingId : labelledBy} className={cn('flex flex-col gap-4', className)}>
      {srHeading ? (
        <h2 id={headingId} className="sr-only">
          {srHeading}
        </h2>
      ) : null}
      {children}
      <BlockLabel blocks={blocks} components={components} />
    </Element>
  );
}
