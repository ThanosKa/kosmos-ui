import { source } from '@/lib/source';
import { DocsBody } from 'fumadocs-ui/layouts/docs/page';
import { notFound } from 'next/navigation';
import { getMDXComponents } from '@/components/mdx';
import type { Metadata } from 'next';
import type { ComponentProps } from 'react';
import { createRelativeLink } from 'fumadocs-ui/mdx';
import { DocsPageLinks, DocsRail } from '@/components/docs/docs-rail';
import { DocsTocDisclosure } from '@/components/docs/docs-toc';
import { DocsPageHeader } from '@/components/docs/page-header';
import { PageNavCards } from '@/components/docs/page-nav';
import { BlockViewers } from '@/components/docs/block-viewer';
import { ComponentPreview } from '@/components/docs/component-preview';
import { HashAnchor } from '@/components/docs/hash-anchor';
import { changelogFolder, getChangelogEntries } from '@/lib/changelog';
import { blockCategoryOfPage, eyebrowOf, groupOfPage, neighboursOf } from '@/lib/docs-nav';
import { cn } from '@/registry/kosmos/lib/cn';
import { docsSourceUrl, getPageImageUrl, getPageMarkdownUrl, siteOpenGraph } from '@/lib/shared';

export default async function Page(props: PageProps<'/docs/[[...slug]]'>) {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  const MDX = page.data.body;
  const pageRef = { path: page.path, title: page.data.title };
  const group = groupOfPage(page);
  const category = blockCategoryOfPage(page);
  const neighbours = neighboursOf(page.url);
  const isChangelog = page.slugs.length === 1 && page.slugs[0] === changelogFolder;
  const toc =
    page.data.full || category
      ? []
      : isChangelog
        ? getChangelogEntries().map((entry) => ({ title: entry.page.data.title, url: `#${entry.page.slugs[1]}`, depth: 2 }))
        : page.data.toc;

  return (
    <div className="flex w-full gap-10 xl:pe-6">
      <article className={cn('mx-auto flex w-full min-w-0 flex-col gap-4 px-4 py-8 sm:px-6 md:py-10', category ? 'max-w-7xl' : 'max-w-3xl')}>
        <DocsPageHeader
          title={page.data.title}
          description={page.data.description}
          date={page.data.date}
          markdownUrl={getPageMarkdownUrl(page).url}
          githubUrl={docsSourceUrl(page.path, 'blob')}
          neighbours={neighbours}
          eyebrow={eyebrowOf(page)}
          item={group && { baseUi: page.data.baseUi, baseUiName: page.data.baseUiName }}
        />
        <DocsTocDisclosure toc={toc} className="xl:hidden" />
        {category && <BlockViewers category={category} />}
        <DocsBody className={cn('[&_:not(pre)>code]:[overflow-wrap:anywhere] [&_h2:not(.not-prose_*)]:text-heading [&_h3:not(.not-prose_*)]:text-title', category && 'max-w-none [&>ol]:max-w-prose [&>p]:max-w-prose [&>ul]:max-w-prose')}>
          <MDX
            components={getMDXComponents({
              // this allows you to link to other pages with relative file paths
              a: createRelativeLink(source, page),
              ComponentPreview: (props: ComponentProps<typeof ComponentPreview>) => (
                <ComponentPreview {...props} pageItem={group && page.slugs[1]} />
              ),
            })}
          />
        </DocsBody>
        {neighbours && <PageNavCards {...neighbours} className="mt-6" />}
        <DocsPageLinks page={pageRef} className={cn('mt-6 border-t border-border pt-6', !category && 'xl:hidden')} />
      </article>
      {!category && <DocsRail page={pageRef} toc={toc} />}
      <HashAnchor />
    </div>
  );
}

export async function generateStaticParams() {
  return source.generateParams();
}

export async function generateMetadata(props: PageProps<'/docs/[[...slug]]'>): Promise<Metadata> {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  return {
    title: page.data.title,
    description: page.data.description,
    openGraph: {
      ...siteOpenGraph,
      url: page.url,
      images: getPageImageUrl(page).url,
    },
  };
}
