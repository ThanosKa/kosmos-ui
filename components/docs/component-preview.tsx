import { ServerCodeBlock } from 'fumadocs-ui/components/codeblock.rsc';
import { Tab, Tabs } from 'fumadocs-ui/components/tabs';
import { readExampleSource } from '@/lib/examples';
import { toInstalledImports } from '@/lib/registry';
import { PreviewFrame } from './preview-frame';

/**
 * A live example and its code. `name` is a file in `registry/kosmos/examples/`
 * (`button-demo` -> `/view/button-demo`). The code shows the imports a user gets after `shadcn add`.
 */
export function ComponentPreview({ name, minHeight }: { name: string; minHeight?: number }) {
  const code = toInstalledImports(readExampleSource(name));
  return (
    <Tabs items={['Preview', 'Code']} className="not-prose">
      <Tab value="Preview" className="p-0">
        <PreviewFrame name={name} minHeight={minHeight} />
      </Tab>
      <Tab value="Code" className="p-0">
        <ServerCodeBlock code={code} lang="tsx" codeblock={{ className: 'my-0 rounded-none border-0' }} />
      </Tab>
    </Tabs>
  );
}
