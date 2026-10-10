import { existsSync } from 'node:fs';
import { join } from 'node:path';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { RootProvider } from 'fumadocs-ui/provider/next';
import { PreviewFrame } from '@/components/docs/preview-frame';
import { examplesDir } from '@/lib/examples';
import { GroupNav } from '@/components/preview/group-nav';
import { groups, isGroup, itemsInGroup } from '@/lib/registry';
import { Button } from '@/registry/kosmos/ui/button';

const themes = ['light', 'dark'] as const;

export function generateStaticParams() {
  return Object.keys(groups).map((group) => ({ group }));
}

export async function generateMetadata(props: PageProps<'/approve/[group]'>): Promise<Metadata> {
  const { group } = await props.params;
  return { title: isGroup(group) ? `Approve ${groups[group]}` : 'Approve' };
}

function hasReviewPreview(name: string) {
  return existsSync(join(/*turbopackIgnore: true*/ process.cwd(), examplesDir, `${name}.tsx`));
}

/**
 * `/approve/<group>`: every component or block whose registry item says `"meta": { "group": "<group>" }`,
 * each as its review preview (`registry/kosmos/examples/<name>.tsx`) in light and in dark,
 * so the maintainer approves the whole group in one pass.
 */
export default async function ApproveGroupPage(props: PageProps<'/approve/[group]'>) {
  const { group } = await props.params;
  if (!isGroup(group)) notFound();
  const items = itemsInGroup(group);

  return (
    <RootProvider search={{ enabled: false }} theme={{ hotKey: false }}>
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 py-8 sm:px-10 sm:py-12">
        <header className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <p className="text-caption tracking-[0.05em] text-muted-foreground uppercase">Approval</p>
            <h1 className="text-heading">{groups[group]}</h1>
            <p className="max-w-[40em] text-small text-muted-foreground">
              {items.length === 0
                ? 'Nothing in this group yet.'
                : `${items.length} ${items.length === 1 ? 'item' : 'items'}, each in every state, in light and dark.`}
            </p>
          </div>
          <GroupNav current={group} />
        </header>

        {items.map((item) => (
          <section key={item.name} id={item.name} aria-labelledby={`${item.name}-title`} className="flex flex-col gap-4">
            <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
              <div className="flex min-w-0 flex-col gap-1">
                <h2 id={`${item.name}-title`} className="text-title">
                  {item.title ?? item.name}
                </h2>
                {item.description ? (
                  <p className="max-w-[40em] text-small text-muted-foreground">{item.description}</p>
                ) : null}
              </div>
              <Button variant="secondary" size="sm" href={`/view/${item.name}`}>
                Open preview
              </Button>
            </div>
            {hasReviewPreview(item.name) ? (
              themes.map((theme) => (
                <figure key={theme} className="flex flex-col gap-2">
                  <figcaption className="text-caption text-muted-foreground capitalize">{theme}</figcaption>
                  <PreviewFrame
                    name={item.name}
                    theme={theme}
                    minHeight={120}
                    className="rounded-xl border border-transparent shadow-card"
                  />
                </figure>
              ))
            ) : (
              <p className="flex items-center gap-2 text-small">
                <span aria-hidden className="size-2 shrink-0 rounded-full bg-destructive" />
                Missing review preview: add {examplesDir}/{item.name}.tsx.
              </p>
            )}
          </section>
        ))}
      </main>
    </RootProvider>
  );
}
