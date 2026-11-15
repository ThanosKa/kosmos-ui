import Image from 'next/image';
import Link from 'next/link';
import { getDocsIndex, type DocsIndexGroup, type DocsIndexItem } from '@/lib/docs-nav';
import { cn } from '@/registry/kosmos/lib/cn';
import { eyebrowClass } from './classes';

type Folder = 'components' | 'charts' | 'blocks';

/** Cards in the first row, at the widest grid: their thumbnails load eagerly, since one is the page's largest paint. */
const firstRow = 3;

const imageSizes = '(min-width: 1024px) 320px, (min-width: 640px) 50vw, 100vw';

/**
 * A card for every component or block category, so the index never needs a hand-kept list. Components sit in their
 * registry groups, block categories in their block sections, both in the same grid. Thumbnails come from `pnpm thumbnails`.
 */
export function DocsIndex({ folder }: { folder: Folder }) {
  return (
    <div className="not-prose flex flex-col gap-10 @container">
      {getDocsIndex(folder).map((group, index) => (
        <IndexGroup key={group.id} group={group} eager={index === 0} />
      ))}
    </div>
  );
}

function IndexGroup({ group, eager }: { group: DocsIndexGroup; eager: boolean }) {
  return (
    <section data-docs-group aria-labelledby={group.anchor} className="flex flex-col gap-3">
      <h2 id={group.anchor} className={cn('flex items-center gap-2 [&_svg]:size-3.5', eyebrowClass)}>
        {group.icon}
        {group.label} <span className="tabular-nums">{group.items.length}</span>
      </h2>
      <IndexGrid items={group.items} eager={eager} />
    </section>
  );
}

function IndexGrid({ items, eager = false }: { items: DocsIndexItem[]; eager?: boolean }) {
  return (
    <ul className="grid grid-cols-1 gap-4 @md:grid-cols-2 @2xl:grid-cols-3">
      {items.map((item, index) => (
        <li key={item.url} className="flex min-w-0">
          <IndexCard item={item} sizes={imageSizes} eager={eager && index < firstRow} />
        </li>
      ))}
    </ul>
  );
}

function IndexCard({ item, sizes, eager }: { item: DocsIndexItem; sizes: string; eager: boolean }) {
  const loading = eager ? 'eager' : 'lazy';
  return (
    <Link
      href={item.url}
      data-docs-card
      className="relative flex w-full min-w-0 flex-col gap-3 rounded-2xl border border-transparent bg-card p-1 pb-3.5 text-card-foreground shadow-card after:pointer-events-none after:absolute after:inset-0 after:rounded-2xl after:bg-accent after:opacity-0 after:transition-[opacity] hover:after:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      <div className="relative aspect-[8/5] overflow-hidden rounded-xl bg-background outline outline-1 -outline-offset-1 outline-black/10 dark:outline-white/10">
        <Image src={`/thumbs/${item.name}-light.png`} alt="" fill sizes={sizes} loading={loading} className="object-cover dark:hidden" />
        <Image src={`/thumbs/${item.name}-dark.png`} alt="" fill sizes={sizes} loading={loading} className="hidden object-cover dark:block" />
      </div>
      <div className="flex min-w-0 flex-col gap-0.5 px-3">
        <span className="truncate text-title">{item.title}</span>
        {item.description ? <span className="line-clamp-2 text-small text-pretty text-muted-foreground">{item.description}</span> : null}
      </div>
    </Link>
  );
}
