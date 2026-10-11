import { CodeBlockTab, CodeBlockTabs, CodeBlockTabsList, CodeBlockTabsTrigger } from 'fumadocs-ui/components/codeblock';
import { ServerCodeBlock } from 'fumadocs-ui/components/codeblock.rsc';
import { cssVarsAsCss, getRegistryItem, packageRunners, registryAddArgs, registryConfig } from '@/lib/registry';

type Runner = (typeof packageRunners)[keyof typeof packageRunners];

/**
 * One code tab per package manager (the same look as a ```npm block), sharing the chosen manager across
 * the site. `code` gets each manager's `shadcn` runner, such as `pnpm dlx shadcn@latest`.
 */
export function PackageManagerTabs({ code }: { code: (runner: Runner) => string }) {
  const managers = Object.keys(packageRunners) as (keyof typeof packageRunners)[];
  return (
    <CodeBlockTabs groupId="package-manager" persist defaultValue={managers[0]}>
      <CodeBlockTabsList>
        {managers.map((manager) => (
          <CodeBlockTabsTrigger
            key={manager}
            value={manager}
            className="rounded-lg focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
          >
            {manager}
          </CodeBlockTabsTrigger>
        ))}
      </CodeBlockTabsList>
      {managers.map((manager) => (
        <CodeBlockTab key={manager} value={manager}>
          <ServerCodeBlock code={code(packageRunners[manager])} lang="bash" />
        </CodeBlockTab>
      ))}
    </CodeBlockTabs>
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
  return <PackageManagerTabs code={(runner) => `${runner} ${command}`} />;
}

/** The `registries` entry for `components.json`. */
export function RegistryConfig() {
  return <ServerCodeBlock code={registryConfig} lang="json" codeblock={{ title: 'components.json' }} />;
}

/** A registry item's CSS variables as the CSS `shadcn add` writes, for manual installation. */
export function RegistryCss({ name }: { name: string }) {
  const item = getRegistryItem(name);
  if (!item?.cssVars) throw new Error(`Registry item "${name}" has no cssVars`);
  return (
    <ServerCodeBlock
      code={cssVarsAsCss(item.cssVars)}
      lang="css"
      codeblock={{ title: 'app/globals.css', className: 'max-h-96' }}
    />
  );
}
