import defaultMdxComponents from 'fumadocs-ui/mdx';
import { Tab, Tabs } from 'fumadocs-ui/components/tabs';
import { TypeTable } from 'fumadocs-ui/components/type-table';
import type { MDXComponents } from 'mdx/types';
import { ComponentInstall, ComponentSource } from '@/components/docs/component-install';
import { ComponentPreview } from '@/components/docs/component-preview';
import { ChangelogEntries } from '@/components/docs/changelog-entries';
import { DocsIndex } from '@/components/docs/docs-index';
import { PackageInstall, RegistryConfig, RegistryCss, ShadcnCommand } from '@/components/docs/shadcn-command';
import { Step, Steps } from '@/components/docs/steps';
import { ColorTokens } from '@/components/docs/foundations/color-tokens';
import { EasingCurves, MotionTokens } from '@/components/docs/foundations/motion-tokens';
import { RadiusScale, ShadowSurfaces } from '@/components/docs/foundations/shadow-surfaces';
import { TypeRoles } from '@/components/docs/foundations/type-roles';
import { LinkCard, LinkCards } from '@/components/docs/link-cards';
import { CodeBlock, Pre } from '@/components/docs/code-block';
import type { ComponentProps } from 'react';

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
    Steps,
    Step,
    ColorTokens,
    TypeRoles,
    ShadowSurfaces,
    RadiusScale,
    MotionTokens,
    EasingCurves,
    PackageInstall,
    LinkCards,
    LinkCard,
    pre: ({ title, className, style, children }: ComponentProps<'pre'>) => (
      <CodeBlock title={title} className={className} style={style}>
        <Pre>{children}</Pre>
      </CodeBlock>
    ),
    ...components,
  } satisfies MDXComponents;
}

export const useMDXComponents = getMDXComponents;

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}
