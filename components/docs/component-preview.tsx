import Link from 'next/link';
import { Fragment } from 'react';
import { loadExample, readExampleSource } from '@/lib/examples';
import { docsRoute } from '@/lib/shared';
import { componentDocsFolder, exampleExtras, readRegistryItems, registryNamespace, toInstalledImports, type RegistryItem } from '@/lib/registry';
import { cn } from '@/registry/kosmos/lib/cn';
import { inlineProseClass } from './classes';
import { HighlightedCode } from './highlighted-code';
import { PreviewShell } from './preview-shell';

function docsUrlOf(item: RegistryItem) {
  if (item.type === 'registry:ui') return `${docsRoute}/${componentDocsFolder(item)}/${item.name}`;
  if (item.type === 'registry:block') return `${docsRoute}/blocks/${item.categories?.[0] ?? item.name}#${item.name}`;
  return undefined;
}

/**
 * The name people read for an example: its item's title, then what the example shows after the item's name
 * (`segmented-gauge-tone` reads "Segmented gauge: tone"). A `-demo` example is the item itself.
 */
function exampleTitle(name: string, items: RegistryItem[]) {
  const item = items
    .filter((candidate) => name === candidate.name || name.startsWith(`${candidate.name}-`))
    .sort((a, b) => b.name.length - a.name.length)[0];
  if (!item) return name.replaceAll('-', ' ');
  const title = item.title ?? item.name;
  const rest = name.slice(item.name.length + 1).replaceAll('-', ' ');
  return rest === '' || rest === 'demo' ? title : `${title}: ${rest}`;
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
 * A live component example in the shared preview shell: Preview and Code tabs, and a link that opens the example
 * alone. `name` is a file in `registry/kosmos/examples/`; the code shows the imports a user gets after `shadcn add`.
 * The example renders in the page, so its menus, popovers and dialogs portal to `document.body` and float over the
 * docs like they would in an app. Blocks show in the block viewer instead. A line under the code names any other
 * `@kosmos` item the example imports beyond `pageItem`, the item the docs page installs. On a chart's page the stage
 * pads less, so the chart takes the width of the docs column.
 */
export async function ComponentPreview({ name, pageItem }: { name: string; pageItem?: string }) {
  const source = readExampleSource(name);
  const code = toInstalledImports(source);
  const Example = await loadExample(name);
  if (!Example) throw new Error(`No example "${name}" in registry/kosmos/examples`);
  const extras = exampleExtras(name, source, pageItem);
  const items = readRegistryItems();
  const item = pageItem ? items.find((candidate) => candidate.name === pageItem) : undefined;
  const onChartPage = item !== undefined && componentDocsFolder(item) === 'charts';

  return (
    <PreviewShell
      title={exampleTitle(name, items)}
      href={`/view/${name}`}
      className="not-prose my-6"
      // The same box as the /view page around an example, so it renders as it does there.
      stageClassName={cn(
        'flex min-h-56 items-center justify-center bg-background p-6 text-body text-foreground sm:min-h-72',
        onChartPage ? 'p-4 sm:p-6' : 'sm:p-10',
      )}
      stage={
        <div data-preview-content className="flex w-full min-w-0 justify-center">
          <Example />
        </div>
      }
      code={
        <>
          <HighlightedCode code={code} lang="tsx" embedded fill />
          {extras.length > 0 && (
            <div className="flex min-h-10 shrink-0 flex-wrap items-center gap-x-4 gap-y-1 border-t border-border px-4 py-2">
              <AlsoUses items={extras} />
            </div>
          )}
        </>
      }
    />
  );
}
