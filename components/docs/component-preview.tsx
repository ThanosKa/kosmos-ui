import { ServerCodeBlock } from 'fumadocs-ui/components/codeblock.rsc';
import { Tab } from 'fumadocs-ui/components/tabs';
import { readExampleSource } from '@/lib/examples';
import { toInstalledImports } from '@/lib/registry';
import { DocsTabs } from './docs-tabs';
import { PreviewFrame } from './preview-frame';

/**
 * A live example and its code. `name` is a file in `registry/kosmos/examples/`
 * (`button-demo` -> `/view/button-demo`). The code shows the imports a user gets after `shadcn add`.
 */
export function ComponentPreview({ name, minHeight }: { name: string; minHeight?: number }) {
  const code = toInstalledImports(readExampleSource(name));
  return (
    <DocsTabs items={['Preview', 'Code']}>
      <Tab value="Preview" className="p-0">
        <PreviewFrame name={name} minHeight={minHeight} />
      </Tab>
      {/* Keep the panel's own padding: Fumadocs pulls a lone code block out by the same amount to fill the panel. */}
      <Tab value="Code">
        <ServerCodeBlock code={code} lang="tsx" />
      </Tab>
    </DocsTabs>
  );
}
