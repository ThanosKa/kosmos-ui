import Link from 'next/link';
import type { ReactNode } from 'react';
import { blockSections, readBlockCategories, readRegistryItems, readTemplates } from '@/lib/registry';
import { Bento, type BentoItem } from '@/registry/kosmos/blocks/bento/bento';

const titleLink =
  'rounded-sm transition-[color] hover:text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring';

function Count({ value }: { value: number }) {
  return <span className="text-hero font-semibold text-foreground tabular-nums">{value}</span>;
}

function countTile(id: string, title: string, href: string | null, value: number, description: ReactNode): BentoItem {
  return {
    id,
    title: href ? (
      <Link href={href} className={titleLink}>
        {title}
      </Link>
    ) : (
      title
    ),
    description,
    visual: <Count value={value} />,
  };
}

/** Joins names as a sentence list: "A", "A and B", "A, B and C". */
function listOf(names: string[]) {
  return names.length < 2 ? names.join('') : `${names.slice(0, -1).join(', ')} and ${names.at(-1)}`;
}

/**
 * The landing's inventory: what the library holds, counted from the registry on every render, so a new component,
 * block category or variant shows up here by itself. Templates join once there are any.
 */
export function Inventory() {
  const components = readRegistryItems().filter((item) => item.type === 'registry:ui');
  const categories = readBlockCategories();
  const variants = categories.flatMap((category) => category.variants);
  const proCount = variants.filter((variant) => variant.tier === 'pro').length;
  const sections = Object.entries(blockSections)
    .filter(([section]) => categories.some((category) => category.section === section))
    .map(([, label]) => label);
  const templates = readTemplates();

  const tiles = [
    countTile('components', 'Components', '/docs/components', components.length, 'Buttons, fields, overlays, tables and charts, each on Base UI.'),
    countTile('block-categories', 'Block categories', '/docs/blocks', categories.length, `${listOf(sections)} pieces, ready to drop into a page.`),
    countTile(
      'variants',
      'Variants',
      '/docs/blocks',
      variants.length,
      proCount ? `${variants.length - proCount} free to install, ${proCount} Pro to try live.` : 'Every one free under MIT, ready to install.',
    ),
    ...(templates.length ? [countTile('templates', 'Templates', null, templates.length, 'Whole apps built from the blocks.')] : []),
  ];

  return <Bento title={null} description={null} items={tiles} />;
}
