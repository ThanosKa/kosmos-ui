import { loadExample, readExampleSource } from '@/lib/examples';
import { getRegistryItem, toInstalledImports } from '@/lib/registry';
import { HighlightedCode } from './highlighted-code';
import { PreviewFrame } from './preview-frame';

/** Blocks lay themselves out by their own viewport width, so they keep the iframe and room for their dialogs. */
const blockFrameHeight = 560;

/**
 * A live example stacked over the first lines of its code, which "Show code" expands in place. `name` is a
 * file in `registry/kosmos/examples/`; the code shows the imports a user gets after `shadcn add`. Component
 * examples render in the page, so their menus, popovers and dialogs portal to `document.body` and float over
 * the docs like they would in an app. Block examples (`<block>-demo`) render in `/view/<name>` inside an iframe.
 */
export async function ComponentPreview({ name }: { name: string }) {
  const code = toInstalledImports(readExampleSource(name));
  const isBlock = getRegistryItem(name.replace(/-demo$/, ''))?.type === 'registry:block';
  const Example = isBlock ? null : await loadExample(name);
  if (!isBlock && !Example) throw new Error(`No example "${name}" in registry/kosmos/examples`);

  return (
    <div
      data-slot="component-preview"
      className="not-prose my-6 min-w-0 rounded-2xl border border-transparent bg-card shadow-card [--inner-radius:calc(var(--radius-2xl)-1px)]"
    >
      {Example ? (
        // The same box as the /view page around an example, so it renders as it does there.
        <div className="flex min-h-80 min-w-0 items-center justify-center rounded-t-(--inner-radius) bg-background p-6 text-base text-foreground sm:min-h-112 sm:p-10">
          <div className="flex w-full min-w-0 justify-center">
            <Example />
          </div>
        </div>
      ) : (
        <PreviewFrame name={name} minHeight={blockFrameHeight} className="rounded-none rounded-t-(--inner-radius)" />
      )}
      <HighlightedCode code={code} lang="tsx" collapse="peek" embedded className="rounded-b-(--inner-radius) border-t border-border" />
    </div>
  );
}
