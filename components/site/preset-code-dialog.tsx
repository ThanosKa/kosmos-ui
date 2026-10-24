'use client';

import { Code } from 'lucide-react';
import { CodeBlock, Pre } from '@/components/docs/code-block';
import { PackageManagerTabs } from '@/components/docs/docs-tabs';
import { chosenPreset, presetCss, presetDesignMd, presetItemName, type PresetChoice } from '@/lib/presets';
import { Button } from '@/registry/kosmos/ui/button';
import { Dialog, DialogBody, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/registry/kosmos/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/registry/kosmos/ui/tabs';

/** Code in a Kosmos code block, unhighlighted: it is written in the browser from the visitor's choice. */
function PlainCode({ code, title, embedded }: { code: string; title?: string; embedded?: boolean }) {
  return (
    <CodeBlock title={title} embedded={embedded} className={embedded ? undefined : 'my-0'}>
      <Pre>
        <code>
          {code
            .replace(/\n$/, '')
            .split('\n')
            .flatMap((line, index) => [index ? '\n' : null, <span key={index} className="line">{line}</span>])}
        </code>
      </Pre>
    </CodeBlock>
  );
}

type PresetCodeDialogProps = {
  choice: PresetChoice;
  /** Each package manager's `shadcn` runner, such as `pnpm dlx shadcn@latest`. */
  runners: Record<string, string>;
  /** The `shadcn` arguments that add the `@kosmos` registry to a project. */
  registryAdd: string;
};

/** "Get code": the chosen preset as CSS, as a registry command and as a DESIGN.md, each with a copy button. */
export function PresetCodeDialog({ choice, runners, registryAdd }: PresetCodeDialogProps) {
  const preset = chosenPreset(choice);
  const item = presetItemName(choice);
  const managers = Object.keys(runners);
  return (
    <Dialog>
      <DialogTrigger render={<Button variant="primary" />}>
        <Code aria-hidden data-icon="inline-start" />
        Get code
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Get the {preset.name} preset</DialogTitle>
          <DialogDescription>The palette and radius you picked, in light and dark.</DialogDescription>
        </DialogHeader>
        <DialogBody className="pb-5">
          {/* Inline-size containment keeps the widest line of code from widening the dialog: the code scrolls instead. */}
          <Tabs defaultValue="css" className="min-w-0 [contain:inline-size]">
            <TabsList>
              <TabsTrigger value="css">CSS</TabsTrigger>
              <TabsTrigger value="registry">Registry</TabsTrigger>
              <TabsTrigger value="design">DESIGN.md</TabsTrigger>
            </TabsList>
            <TabsContent value="css" className="flex flex-col gap-3">
              <p className="text-small text-muted-foreground">Paste it after the Kosmos tokens in your global CSS: light on <code className="font-mono">:root</code>, dark on <code className="font-mono">.dark</code>.</p>
              <PlainCode title="app/globals.css" code={presetCss(preset)} />
            </TabsContent>
            <TabsContent value="registry" className="flex flex-col gap-3">
              <p className="text-small text-muted-foreground">Adds the @kosmos registry once, then installs the tokens with this preset over them.</p>
              <PackageManagerTabs
                managers={managers}
                panels={Object.fromEntries(
                  managers.map((manager) => [
                    manager,
                    <PlainCode key={manager} embedded code={`${runners[manager]} ${registryAdd}\n${runners[manager]} add @kosmos/${item}`} />,
                  ]),
                )}
              />
            </TabsContent>
            <TabsContent value="design" className="flex flex-col gap-3">
              <p className="text-small text-muted-foreground">Save it as DESIGN.md at the root of your project, so an agent builds new screens in this preset.</p>
              <PlainCode title="DESIGN.md" code={presetDesignMd(preset)} />
            </TabsContent>
          </Tabs>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}
