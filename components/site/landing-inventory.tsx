import Image from 'next/image';
import Link from 'next/link';
import { getDocsIndex, type DocsIndexItem } from '@/lib/docs-nav';
import { docsRoute } from '@/lib/shared';
import { Bento, type BentoItem } from '@/registry/kosmos/blocks/bento/bento';
import { buttonVariants } from '@/registry/kosmos/ui/button';
import { NumberTicker } from '@/registry/kosmos/ui/number-ticker';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/registry/kosmos/ui/tabs';
import { LandingTitle } from './landing-section';

/** The items each tab shows first, in order, by thumbnail name; the rest wait behind its "See all" link. */
const featured = {
  components: ['dropdown-menu', 'stat-card', 'prompt-composer', 'select', 'toast', 'tool-approval'],
  blocks: ['data-table', 'stats-overview', 'kanban-board', 'auth-forms', 'pricing', 'run-timeline'],
} as const;

type Shelf = keyof typeof featured;

const thumbnailSizes = '(min-width: 1152px) 370px, (min-width: 576px) 50vw, 100vw';

const titleLink =
  'rounded-sm transition-[color] hover:text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring';

/** A card for one item: its thumbnail in light and dark, its name linking to its docs page and its one-line description. */
function tile(item: DocsIndexItem): BentoItem {
  return {
    id: item.name,
    title: (
      <Link href={item.url} className={titleLink}>
        {item.title}
      </Link>
    ),
    description: <span className="line-clamp-1">{item.description}</span>,
    // The thumbnail fills the tile's well edge to edge, its outline standing in for the well's inset edge.
    visual: (
      <span className="absolute inset-0 overflow-hidden rounded-[inherit] outline outline-1 -outline-offset-1 outline-black/10 dark:outline-white/10">
        <Image src={`/thumbs/${item.name}-light.png`} alt="" fill sizes={thumbnailSizes} className="object-cover dark:hidden" />
        <Image src={`/thumbs/${item.name}-dark.png`} alt="" fill sizes={thumbnailSizes} className="hidden object-cover dark:block" />
      </span>
    ),
  };
}

function featuredItems(shelf: Shelf, items: DocsIndexItem[]) {
  return featured[shelf].map((name) => {
    const item = items.find((candidate) => candidate.name === name);
    if (!item) throw new Error(`The landing inventory features "${name}", which is no ${shelf} docs page`);
    return tile(item);
  });
}

export const landingInventoryHeadingId = 'landing-inventory-heading';

/**
 * The landing's inventory: a tab for components and one for blocks, each with its count, its first six items as
 * cards and a link to the rest. Counted from the docs on every build, so a new component or block category shows up
 * by itself. Phones show the first three cards of a tab.
 */
export function Inventory() {
  const components = getDocsIndex('components').flatMap((group) => group.items);
  const blocks = getDocsIndex('blocks').flatMap((group) => group.items);
  const shelves = [
    { id: 'components', label: 'Components', items: components, all: `See all ${components.length} components`, href: `${docsRoute}/components` },
    { id: 'blocks', label: 'Blocks', items: blocks, all: `See all ${blocks.length} blocks`, href: `${docsRoute}/blocks` },
  ] as const;

  return (
    <div className="flex flex-col gap-8">
      <LandingTitle id={landingInventoryHeadingId}>
        Everything for the app,
        <br />
        and the page that sells it
      </LandingTitle>
      <Tabs defaultValue="components" className="items-center gap-8">
        <TabsList aria-label="Library">
          {shelves.map((shelf) => (
            <TabsTrigger key={shelf.id} value={shelf.id}>
              {shelf.label}
              <NumberTicker value={shelf.items.length} className="text-muted-foreground" />
            </TabsTrigger>
          ))}
        </TabsList>
        {shelves.map((shelf) => (
          <TabsContent key={shelf.id} value={shelf.id} tabIndex={-1} className="flex w-full flex-col items-center gap-10">
            <Bento
              title={null}
              description={null}
              items={featuredItems(shelf.id, shelf.items)}
              className="w-full max-sm:[&_[data-slot=bento-item]:nth-child(n+4)]:hidden [&_[data-slot=bento-item-visual]]:relative [&_[data-slot=bento-item-visual]]:aspect-[8/5]"
            />
            <Link href={shelf.href} className={buttonVariants({ variant: 'secondary', size: 'lg' })}>
              {shelf.all}
            </Link>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
