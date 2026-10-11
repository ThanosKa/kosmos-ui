import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { Fragment, type ReactNode } from 'react';
import { ServerCodeBlock } from 'fumadocs-ui/components/codeblock.rsc';
import { Tab } from 'fumadocs-ui/components/tabs';
import {
  cssVarsAsCss,
  installCommands,
  installedPath,
  resolveRegistryTree,
  toInstalledImports,
  type RegistryItem,
} from '@/lib/registry';
import { DocsTabs } from './docs-tabs';
import { PackageManagerTabs } from './shadcn-command';

function Step({ children }: { children: ReactNode }) {
  return <p className="mt-4 mb-2 text-small text-fd-muted-foreground first:mt-0">{children}</p>;
}

/** The source files of an item, as they land in the user's project. */
export function ComponentSource({ name, item }: { name: string; item?: RegistryItem }) {
  const target = item ?? resolveRegistryTree(name)[0];
  return (
    <>
      {(target.files ?? []).map((file) => (
        <ServerCodeBlock
          key={file.path}
          code={toInstalledImports(readFileSync(join(/*turbopackIgnore: true*/ process.cwd(), file.path), 'utf8'))}
          lang={file.path.split('.').pop() ?? 'tsx'}
          codeblock={{ title: installedPath(file), className: 'my-0' }}
        />
      ))}
    </>
  );
}

/** CLI and manual installation for a registry item, with every `@kosmos/*` dependency it pulls in. */
export function ComponentInstall({ name }: { name: string }) {
  const [item, ...deps] = resolveRegistryTree(name);
  const packages = [...new Set([item, ...deps].flatMap((entry) => entry.dependencies ?? []))];

  return (
    <DocsTabs items={['CLI', 'Manual']}>
      <Tab value="CLI">
        <PackageManagerTabs code={(runner) => installCommands(name, runner)} />
      </Tab>
      <Tab value="Manual">
        {packages.length > 0 && (
          <>
            <Step>Install the dependencies.</Step>
            <ServerCodeBlock code={`npm install ${packages.join(' ')}`} lang="bash" codeblock={{ className: 'my-0' }} />
          </>
        )}
        {deps.map((dep) => (
          // A Fragment, not a wrapper, so `first:mt-0` on Step matches only the panel's first step.
          <Fragment key={dep.name}>
            {dep.cssVars && (
              <>
                <Step>Add the {dep.title ?? dep.name} to your global CSS, after the Tailwind import.</Step>
                <ServerCodeBlock
                  code={cssVarsAsCss(dep.cssVars)}
                  lang="css"
                  codeblock={{ title: 'app/globals.css', className: 'my-0 max-h-80' }}
                />
              </>
            )}
            {(dep.files ?? []).length > 0 && (
              <>
                <Step>Copy {dep.title ?? dep.name}.</Step>
                <ComponentSource name={dep.name} item={dep} />
              </>
            )}
          </Fragment>
        ))}
        <Step>Copy the component.</Step>
        <ComponentSource name={name} item={item} />
      </Tab>
    </DocsTabs>
  );
}
