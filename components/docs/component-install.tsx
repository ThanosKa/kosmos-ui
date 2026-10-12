import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { ReactNode } from 'react';
import {
  cssVarsAsCss,
  installCommands,
  installedPath,
  resolveRegistryTree,
  toInstalledImports,
  type RegistryItem,
} from '@/lib/registry';
import { DocsTabs } from './docs-tabs';
import { HighlightedCode } from './highlighted-code';
import { PackageInstall, PackageManagerCode } from './shadcn-command';
import { Step, Steps } from './steps';

/** The source files of an item, as they land in the user's project. */
export function ComponentSource({
  name,
  item,
  lineNumbers,
}: {
  name: string;
  item?: RegistryItem;
  lineNumbers?: boolean;
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

/** CLI and manual installation for a registry item, with every `@kosmos/*` dependency it pulls in. */
export function ComponentInstall({ name }: { name: string }) {
  const [item, ...deps] = resolveRegistryTree(name);
  const packages = [...new Set([item, ...deps].flatMap((entry) => entry.dependencies ?? []))];

  return (
    <DocsTabs
      tabs={[
        { label: 'CLI', content: <PackageManagerCode code={(runner) => installCommands(name, runner)} /> },
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
