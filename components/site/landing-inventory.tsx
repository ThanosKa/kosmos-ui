import Link from 'next/link';
import type { ReactNode } from 'react';
import { blockSections, readBlockCategories, readRegistryItems } from '@/lib/registry';
import { Bento, type BentoItem } from '@/registry/kosmos/blocks/bento/bento';

const titleLink =
  'rounded-sm transition-[color] hover:text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring';

function Count({ value }: { value: number }) {
  return <span className="text-hero font-semibold text-foreground tabular-nums">{value}</span>;
}

function countTile(id: string, title: string, href: string, value: number, description: ReactNode): BentoItem {
  return {
    id,
    title: (
      <Link href={href} className={titleLink}>
        {title}
      </Link>
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
 * block category or variant shows up here by itself.
 */
export function Inventory() {
  const components = readRegistryItems().filter((item) => item.type === 'registry:ui');
  const categories = readBlockCategories();
  const variants = categories.flatMap((category) => category.variants);
  const proCount = variants.filter((variant) => variant.tier === 'pro').length;
  const sections = Object.entries(blockSections)
    .filter(([section]) => categories.some((category) => category.section === section))
    .map(([, label]) => label);

  const tiles = [
    countTile('components', 'Components', '/docs/components', components.length, 'Buttons, fields, overlays and charts on Base UI.'),
    countTile('block-categories', 'Block categories', '/docs/blocks', categories.length, `Sorted into ${listOf(sections)}.`),
    countTile(
      'variants',
      'Variants',
      '/docs/blocks',
      variants.length,
      proCount ? `${variants.length - proCount} free to install, ${proCount} Pro to try live.` : 'Every one free under MIT, ready to install.',
    ),
  ];

  return <Bento title={null} description={null} items={tiles} />;
}
