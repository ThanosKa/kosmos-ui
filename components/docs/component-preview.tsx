import { ServerCodeBlock } from 'fumadocs-ui/components/codeblock.rsc';
import { Tab } from 'fumadocs-ui/components/tabs';
import { loadExample, readExampleSource } from '@/lib/examples';
import { getRegistryItem, toInstalledImports } from '@/lib/registry';
import { DocsTabs } from './docs-tabs';
import { PreviewFrame } from './preview-frame';

/** Blocks lay themselves out by their own viewport width, so they keep the iframe and room for their dialogs. */
const blockFrameHeight = 560;

/**
 * A live example and its code. `name` is a file in `registry/kosmos/examples/`; the code shows the
 * imports a user gets after `shadcn add`. Component examples render in the page, so their menus, popovers
 * and dialogs portal to `document.body` and float over the docs like they would in an app. Block examples
 * (`<block>-demo`) render in `/view/<name>` inside an iframe.
 */
export async function ComponentPreview({ name }: { name: string }) {
  const code = toInstalledImports(readExampleSource(name));
  const isBlock = getRegistryItem(name.replace(/-demo$/, ''))?.type === 'registry:block';
  const Example = isBlock ? null : await loadExample(name);
  if (!isBlock && !Example) throw new Error(`No example "${name}" in registry/kosmos/examples`);

  return (
    <DocsTabs items={['Preview', 'Code']}>
      <Tab value="Preview" className="p-0">
        {Example ? (
          // The same box as the /view page around an example, so it renders as it does there.
          <div className="flex min-h-80 items-center justify-center bg-background p-6 text-base text-foreground sm:min-h-112 sm:p-10">
            <div className="flex w-full justify-center">
              <Example />
            </div>
          </div>
        ) : (
          <PreviewFrame name={name} minHeight={blockFrameHeight} />
        )}
      </Tab>
      {/* Keep the panel's own padding: Fumadocs pulls a lone code block out by the same amount to fill the panel. */}
      <Tab value="Code">
        <ServerCodeBlock code={code} lang="tsx" />
      </Tab>
    </DocsTabs>
  );
}
