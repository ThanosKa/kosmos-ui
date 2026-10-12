import Image from 'next/image';
import Link from 'next/link';
import { getDocsIndex, type DocsIndexGroup, type DocsIndexItem } from '@/lib/docs-nav';
import { cn } from '@/registry/kosmos/lib/cn';
import { eyebrowClass } from './classes';

type Folder = 'components' | 'blocks';

const imageSizes: Record<Folder, string> = {
  components: '(min-width: 1024px) 320px, (min-width: 640px) 50vw, 100vw',
  blocks: '(min-width: 1024px) 480px, 100vw',
};

/**
 * A card for every component or block, so the index never needs a hand-kept list. Components sit in
 * their registry groups; blocks form one grid of larger cards. Thumbnails come from `pnpm thumbnails`.
 */
export function DocsIndex({ folder }: { folder: Folder }) {
  const groups = getDocsIndex(folder);
  if (folder === 'blocks') {
    return (
      <div className="not-prose @container">
        <IndexGrid folder={folder} items={groups.flatMap((group) => group.items)} />
      </div>
    );
  }
  return (
    <div className="not-prose flex flex-col gap-10 @container">
      {groups.map((group) => (
        <IndexGroup key={group.id} group={group} />
      ))}
    </div>
  );
}

function IndexGroup({ group }: { group: DocsIndexGroup }) {
  const headingId = `group-${group.id}`;
  return (
    <section data-docs-group aria-labelledby={headingId} className="flex flex-col gap-3">
      <h2
        id={headingId}
        className={cn('flex items-center gap-2 [&_svg]:size-3.5', eyebrowClass)}
      >
        {group.icon}
        {group.label} <span className="tabular-nums">{group.items.length}</span>
      </h2>
      <IndexGrid folder="components" items={group.items} />
    </section>
  );
}

function IndexGrid({ folder, items }: { folder: Folder; items: DocsIndexItem[] }) {
  return (
    <ul className={cn('grid grid-cols-1 gap-4', folder === 'components' ? '@md:grid-cols-2 @2xl:grid-cols-3' : '@3xl:grid-cols-2')}>
      {items.map((item) => (
        <li key={item.url} className="flex min-w-0">
          <IndexCard item={item} sizes={imageSizes[folder]} />
        </li>
      ))}
    </ul>
  );
}

function IndexCard({ item, sizes }: { item: DocsIndexItem; sizes: string }) {
  return (
    <Link
      href={item.url}
      data-docs-card
      className="relative flex w-full min-w-0 flex-col gap-3 rounded-2xl border border-transparent bg-card p-1 pb-3.5 text-card-foreground shadow-card after:pointer-events-none after:absolute after:inset-0 after:rounded-2xl after:bg-accent after:opacity-0 after:transition-[opacity] hover:after:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      <div className="relative aspect-[8/5] overflow-hidden rounded-xl bg-background outline outline-1 -outline-offset-1 outline-black/10 dark:outline-white/10">
        <Image src={`/thumbs/${item.name}-light.png`} alt="" fill sizes={sizes} className="object-cover dark:hidden" />
        <Image src={`/thumbs/${item.name}-dark.png`} alt="" fill sizes={sizes} className="hidden object-cover dark:block" />
      </div>
      <div className="flex min-w-0 flex-col gap-0.5 px-3">
        <span className="truncate text-title">{item.title}</span>
        {item.description ? <span className="line-clamp-2 text-small text-pretty text-muted-foreground">{item.description}</span> : null}
      </div>
    </Link>
  );
}
