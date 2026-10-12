import type { ReactNode } from 'react';
import { cssVarsAsCss, getRegistryItem, packageInstallers, packageRunners, registryAddArgs, registryConfig } from '@/lib/registry';
import { PackageManagerTabs } from './docs-tabs';
import { HighlightedCode } from './highlighted-code';

type Manager = keyof typeof packageRunners;
type Runner = (typeof packageRunners)[Manager];

/**
 * One code tab per package manager, sharing the chosen manager across the site. `code` gets each manager's
 * `shadcn` runner, such as `pnpm dlx shadcn@latest`, and its name.
 */
export function PackageManagerCode({ code }: { code: (runner: Runner, manager: Manager) => string }) {
  const managers = Object.keys(packageRunners) as Manager[];
  return (
    <PackageManagerTabs
      managers={managers}
      panels={
        Object.fromEntries(
          managers.map((manager) => [
            manager,
            <HighlightedCode key={manager} code={code(packageRunners[manager], manager)} lang="bash" embedded />,
          ]),
        ) as Record<Manager, ReactNode>
      }
    />
  );
}

/**
 * A `shadcn` CLI command, one tab per package manager.
 * `<ShadcnCommand args="add @kosmos/button" />`, or `<ShadcnCommand registryAdd />` for the `@kosmos`
 * registry entry, so the registry URL is never written in MDX.
 */
export function ShadcnCommand({ args, registryAdd }: { args?: string; registryAdd?: boolean }) {
  const command = registryAdd ? registryAddArgs : args;
  if (!command) throw new Error('ShadcnCommand needs `args` or `registryAdd`');
  return <PackageManagerCode code={(runner) => `${runner} ${command}`} />;
}

/** Adds npm packages with the chosen package manager: `<PackageInstall packages="cn" />`. */
export function PackageInstall({ packages }: { packages: string }) {
  return <PackageManagerCode code={(_, manager) => `${packageInstallers[manager]} ${packages}`} />;
}

/** The `registries` entry for `components.json`. */
export function RegistryConfig() {
  return <HighlightedCode code={registryConfig} lang="json" title="components.json" />;
}

/** A registry item's CSS variables as the CSS `shadcn add` writes, for manual installation. */
export function RegistryCss({ name }: { name: string }) {
  const item = getRegistryItem(name);
  if (!item?.cssVars) throw new Error(`Registry item "${name}" has no cssVars`);
  return <HighlightedCode code={cssVarsAsCss(item.cssVars)} lang="css" title="app/globals.css" />;
}
