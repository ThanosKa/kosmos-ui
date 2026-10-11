import defaultMdxComponents from 'fumadocs-ui/mdx';
import { Tab, Tabs } from 'fumadocs-ui/components/tabs';
import { TypeTable } from 'fumadocs-ui/components/type-table';
import type { MDXComponents } from 'mdx/types';
import { ComponentInstall, ComponentSource } from '@/components/docs/component-install';
import { ComponentPreview } from '@/components/docs/component-preview';
import { ChangelogEntries } from '@/components/docs/changelog-entries';
import { DocsIndex } from '@/components/docs/docs-index';
import { RegistryConfig, RegistryCss, ShadcnCommand } from '@/components/docs/shadcn-command';

export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    Tab,
    Tabs,
    TypeTable,
    ComponentPreview,
    ComponentInstall,
    ComponentSource,
    ShadcnCommand,
    RegistryConfig,
    RegistryCss,
    ChangelogEntries,
    DocsIndex,
    ...components,
  } satisfies MDXComponents;
}

export const useMDXComponents = getMDXComponents;

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}
