import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { Fragment } from 'react';
import { loadExample, readExampleSource } from '@/lib/examples';
import { docsRoute } from '@/lib/shared';
import { exampleExtras, getRegistryItem, registryNamespace, toInstalledImports, type RegistryItem } from '@/lib/registry';
import { cn } from '@/registry/kosmos/lib/cn';
import { Button } from '@/registry/kosmos/ui/button';
import { inlineProseClass } from './classes';
import { HighlightedCode } from './highlighted-code';
import { PreviewFrame } from './preview-frame';

/** Blocks lay themselves out by their own viewport width, so they keep the iframe and room for their dialogs. */
const blockFrameHeight = 560;

function docsUrlOf(item: RegistryItem) {
  if (item.type === 'registry:ui') return `${docsRoute}/components/${item.name}`;
  if (item.type === 'registry:block') return `${docsRoute}/blocks/${item.name}`;
  return undefined;
}

function AlsoUses({ items }: { items: RegistryItem[] }) {
  const names = items.map((item) => item.title ?? item.name);
  const parts = new Intl.ListFormat('en', { type: 'conjunction' }).formatToParts(names);
  return (
    <p className={cn('min-w-0 text-small text-muted-foreground', inlineProseClass)}>
      Also uses{' '}
      {parts.map((part, index) => {
        if (part.type === 'literal') return <Fragment key={index}>{part.value}</Fragment>;
        const item = items[names.indexOf(part.value)];
        const url = docsUrlOf(item);
        return url ? (
          <Link key={index} href={url}>
            {part.value}
          </Link>
        ) : (
          <code key={index}>{`${registryNamespace}/${item.name}`}</code>
        );
      })}
      .
    </p>
  );
}

/**
 * A live example stacked over the first lines of its code, which "Show code" expands in place. `name` is a
 * file in `registry/kosmos/examples/`; the code shows the imports a user gets after `shadcn add`. Component
 * examples render in the page, so their menus, popovers and dialogs portal to `document.body` and float over
 * the docs like they would in an app; `tall` gives one more room. Block examples (`<block>-demo`) render in
 * `/view/<name>` inside an iframe, with a link to open that page on its own. A line under the preview names any
 * other `@kosmos` item the example imports beyond `pageItem`, the item the docs page installs.
 */
export async function ComponentPreview({ name, tall, pageItem }: { name: string; tall?: boolean; pageItem?: string }) {
  const source = readExampleSource(name);
  const code = toInstalledImports(source);
  const isBlock = getRegistryItem(name.replace(/-demo$/, ''))?.type === 'registry:block';
  const Example = isBlock ? null : await loadExample(name);
  if (!isBlock && !Example) throw new Error(`No example "${name}" in registry/kosmos/examples`);
  const extras = exampleExtras(name, source, pageItem);

  return (
    <div
      data-slot="component-preview"
      className="not-prose my-6 min-w-0 rounded-2xl border border-transparent bg-card shadow-card [--inner-radius:calc(var(--radius-2xl)-1px)]"
    >
      {Example ? (
        // The same box as the /view page around an example, so it renders as it does there.
        <div
          className={cn(
            'flex min-h-56 min-w-0 items-center justify-center rounded-t-(--inner-radius) bg-background p-6 text-body text-foreground sm:p-10',
            tall ? 'sm:min-h-112' : 'sm:min-h-72',
          )}
        >
          <div className="flex w-full min-w-0 justify-center">
            <Example />
          </div>
        </div>
      ) : (
        <PreviewFrame name={name} minHeight={blockFrameHeight} className="rounded-none rounded-t-(--inner-radius)" />
      )}
      {(isBlock || extras.length > 0) && (
        <div className="flex min-h-10 flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t border-border px-4 py-2">
          {extras.length > 0 ? <AlsoUses items={extras} /> : <span />}
          {isBlock && (
            <Button variant="ghost" size="sm" href={`/view/${name}`} target="_blank" rel="noreferrer" className="-me-2">
              Open preview
              <ArrowUpRight data-icon="inline-end" aria-hidden />
              <span className="sr-only">(opens in a new tab)</span>
            </Button>
          )}
        </div>
      )}
      <HighlightedCode code={code} lang="tsx" collapse="peek" embedded className="rounded-b-(--inner-radius) border-t border-border" />
    </div>
  );
}
