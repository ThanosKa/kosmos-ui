import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import Link from 'next/link';
import type { ReactNode } from 'react';
import {
  cssVarsAsCss,
  registryNamespace,
  installedPath,
  resolveRegistryTree,
  toInstalledImports,
  type RegistryItem,
} from '@/lib/registry';
import { cn } from '@/registry/kosmos/lib/cn';
import { inlineProseClass } from './classes';
import { DocsTabs } from './docs-tabs';
import { HighlightedCode } from './highlighted-code';
import { PackageInstall, PackageManagerCode } from './shadcn-command';
import { Step, Steps } from './steps';

/** The source files of an item, as they land in the user's project. `embedded` draws them inside another surface. */
export function ComponentSource({
  name,
  item,
  lineNumbers,
  embedded,
  fill,
}: {
  name: string;
  item?: RegistryItem;
  lineNumbers?: boolean;
  embedded?: boolean;
  /** Each file fills its share of a fixed-height flex column and scrolls inside it. */
  fill?: boolean;
}) {
  const target = item ?? resolveRegistryTree(name)[0];
  return (
    <>
      {(target.files ?? []).map((file) => (
        <HighlightedCode
          key={file.path}
          code={toInstalledImports(readFileSync(join(/*turbopackIgnore: true*/ process.cwd(), file.path), 'utf8'))}
          lang={file.path.split('.').pop() ?? 'tsx'}
          title={installedPath(file)}
          lineNumbers={lineNumbers}
          embedded={embedded}
          fill={fill}
        />
      ))}
    </>
  );
}

function InstallStep({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Step>
      <p className="pt-1 text-body font-medium text-foreground">{title}</p>
      {children}
    </Step>
  );
}

/**
 * CLI and manual installation for a registry item, with every `@kosmos/*` dependency it pulls in. The CLI tab is the
 * one `add` line; the once-per-project setup (the registry and the tokens) lives on the Installation page.
 */
export function ComponentInstall({ name }: { name: string }) {
  const [item, ...deps] = resolveRegistryTree(name);
  const packages = [...new Set([item, ...deps].flatMap((entry) => entry.dependencies ?? []))];

  return (
    <DocsTabs
      tabs={[
        {
          label: 'CLI',
          content: (
            <>
              <PackageManagerCode code={(runner) => `${runner} add ${registryNamespace}/${name}`} />
              <p className={cn('mt-3 text-small text-muted-foreground', inlineProseClass)}>
                New to Kosmos? Add the registry and the tokens once per project, as <Link href="/docs/installation">Installation</Link> shows.
              </p>
            </>
          ),
        },
        {
          label: 'Manual',
          content: (
            <Steps data-slot="manual-install" className="my-0">
              {packages.length > 0 && (
                <InstallStep title="Install the dependencies.">
                  <PackageInstall packages={packages.join(' ')} />
                </InstallStep>
              )}
              {deps.flatMap((dep) => [
                dep.cssVars && (
                  <InstallStep
                    key={`${dep.name}-css`}
                    title={`Add the ${dep.title ?? dep.name} to your global CSS, after the Tailwind import.`}
                  >
                    <HighlightedCode code={cssVarsAsCss(dep.cssVars)} lang="css" title="app/globals.css" />
                  </InstallStep>
                ),
                (dep.files ?? []).length > 0 && (
                  <InstallStep key={`${dep.name}-files`} title={`Copy ${dep.title ?? dep.name}.`}>
                    <ComponentSource name={dep.name} item={dep} lineNumbers />
                  </InstallStep>
                ),
              ])}
              <InstallStep title="Copy the component.">
                <ComponentSource name={name} item={item} lineNumbers />
              </InstallStep>
            </Steps>
          ),
        },
      ]}
    />
  );
}
