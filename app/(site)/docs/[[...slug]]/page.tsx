import { source } from '@/lib/source';
import { DocsBody } from 'fumadocs-ui/layouts/docs/page';
import { notFound } from 'next/navigation';
import { getMDXComponents } from '@/components/mdx';
import type { Metadata } from 'next';
import { createRelativeLink } from 'fumadocs-ui/mdx';
import { DocsPageLinks, DocsRail } from '@/components/docs/docs-rail';
import { DocsTocDisclosure } from '@/components/docs/docs-toc';
import { DocsPageHeader } from '@/components/docs/page-header';
import { PageNavCards } from '@/components/docs/page-nav';
import { groupOfPage, neighboursOf } from '@/lib/docs-nav';
import { getPageImageUrl, getPageMarkdownUrl, gitConfig } from '@/lib/shared';

export default async function Page(props: PageProps<'/docs/[[...slug]]'>) {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  const MDX = page.data.body;
  const pageRef = { path: page.path, title: page.data.title };
  const group = groupOfPage(page);
  const neighbours = neighboursOf(page.url);
  const toc = page.data.full ? [] : page.data.toc;

  return (
    <div className="flex w-full gap-10 xl:pe-6">
      <article className="mx-auto flex w-full max-w-3xl min-w-0 flex-col gap-4 px-4 py-8 sm:px-6 md:py-10">
        <DocsPageHeader
          title={page.data.title}
          description={page.data.description}
          date={page.data.date}
          markdownUrl={getPageMarkdownUrl(page).url}
          githubUrl={`https://github.com/${gitConfig.user}/${gitConfig.repo}/blob/${gitConfig.branch}/content/docs/${page.path}`}
          neighbours={neighbours}
          item={group && { name: page.slugs[1], group, baseUi: page.data.baseUi }}
        />
        <DocsTocDisclosure toc={toc} className="xl:hidden" />
        <DocsBody className="[&_h2:not(.not-prose_*)]:text-heading [&_h3:not(.not-prose_*)]:text-title">
          <MDX
            components={getMDXComponents({
              // this allows you to link to other pages with relative file paths
              a: createRelativeLink(source, page),
            })}
          />
        </DocsBody>
        {neighbours && <PageNavCards {...neighbours} className="mt-6" />}
        <DocsPageLinks page={pageRef} className="mt-6 border-t border-border pt-6 xl:hidden" />
      </article>
      <DocsRail page={pageRef} toc={toc} />
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
      images: getPageImageUrl(page).url,
    },
  };
}
