import Link from 'fumadocs-core/link';
import type { MDXComponents } from 'mdx/types';
import type { ComponentProps } from 'react';
import { ApiTable } from '@/components/docs/api-table';
import { ComponentInstall, ComponentSource } from '@/components/docs/component-install';
import { ComponentPreview } from '@/components/docs/component-preview';
import { ChangelogEntries } from '@/components/docs/changelog-entries';
import { CodeBlock, Pre } from '@/components/docs/code-block';
import { DocsHeading } from '@/components/docs/docs-heading';
import { DocsImage } from '@/components/docs/docs-image';
import { DocsIndex } from '@/components/docs/docs-index';
import { ColorTokens } from '@/components/docs/foundations/color-tokens';
import { EasingCurves, MotionTokens } from '@/components/docs/foundations/motion-tokens';
import { RadiusScale, ShadowSurfaces } from '@/components/docs/foundations/shadow-surfaces';
import { TypeRoles } from '@/components/docs/foundations/type-roles';
import { LinkCard, LinkCards } from '@/components/docs/link-cards';
import {
  MdxTable,
  MdxTableBody,
  MdxTableCell,
  MdxTableHead,
  MdxTableHeader,
  MdxTableRow,
} from '@/components/docs/mdx-table';
import { PackageInstall, RegistryConfig, RegistryCss, ShadcnCommand } from '@/components/docs/shadcn-command';
import { Step, Steps } from '@/components/docs/steps';

type HeadingProps = ComponentProps<'h2'>;

/**
 * Every element and component docs MDX may use. Only what is listed here renders, so a Fumadocs default never
 * slips in unstyled. A new component also needs an `mdxAsPlaceholder` entry in lib/source.ts and a
 * placeholder in lib/llms.ts.
 */
export function getMDXComponents(components?: MDXComponents) {
  return {
    a: Link,
    img: DocsImage,
    h1: (props: HeadingProps) => <DocsHeading as="h1" {...props} />,
    h2: (props: HeadingProps) => <DocsHeading as="h2" {...props} />,
    h3: (props: HeadingProps) => <DocsHeading as="h3" {...props} />,
    h4: (props: HeadingProps) => <DocsHeading as="h4" {...props} />,
    h5: (props: HeadingProps) => <DocsHeading as="h5" {...props} />,
    h6: (props: HeadingProps) => <DocsHeading as="h6" {...props} />,
    table: MdxTable,
    thead: MdxTableHeader,
    tbody: MdxTableBody,
    tr: MdxTableRow,
    th: MdxTableHead,
    td: MdxTableCell,
    pre: ({ title, className, style, children }: ComponentProps<'pre'>) => (
      <CodeBlock title={title} className={className} style={style}>
        <Pre>{children}</Pre>
      </CodeBlock>
    ),
    TypeTable: ApiTable,
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
    ...components,
  } satisfies MDXComponents;
}

export const useMDXComponents = getMDXComponents;

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}
