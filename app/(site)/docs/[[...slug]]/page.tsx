import { source } from '@/lib/source';
import { DocsBody, DocsDescription, DocsTitle, MarkdownCopyButton, ViewOptionsPopover } from 'fumadocs-ui/layouts/docs/page';
import { notFound } from 'next/navigation';
import { getMDXComponents } from '@/components/mdx';
import type { Metadata } from 'next';
import { createRelativeLink } from 'fumadocs-ui/mdx';
import { DocsPageLinks, DocsRail } from '@/components/docs/docs-rail';
import { getPageImageUrl, getPageMarkdownUrl, gitConfig } from '@/lib/shared';
import { formatChangelogDate } from '@/lib/changelog';

export default async function Page(props: PageProps<'/docs/[[...slug]]'>) {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  const MDX = page.data.body;
  const markdownUrl = getPageMarkdownUrl(page).url;
  const pageRef = { path: page.path, title: page.data.title };

  return (
    <div className="flex w-full gap-10 xl:pe-6">
      <article className="mx-auto flex w-full max-w-3xl min-w-0 flex-col gap-4 px-4 py-8 sm:px-6 md:py-10">
        {page.data.date && (
          <time dateTime={page.data.date.toISOString().slice(0, 10)} className="text-small text-muted-foreground">
            {formatChangelogDate(page.data.date)}
          </time>
        )}
        <DocsTitle>{page.data.title}</DocsTitle>
        <DocsDescription className="mb-0">{page.data.description}</DocsDescription>
        <div className="flex flex-row items-center gap-2 border-b pb-6">
          <MarkdownCopyButton markdownUrl={markdownUrl} />
          <ViewOptionsPopover
            markdownUrl={markdownUrl}
            githubUrl={`https://github.com/${gitConfig.user}/${gitConfig.repo}/blob/${gitConfig.branch}/content/docs/${page.path}`}
          />
        </div>
        <DocsBody>
          <MDX
            components={getMDXComponents({
              // this allows you to link to other pages with relative file paths
              a: createRelativeLink(source, page),
            })}
          />
        </DocsBody>
        <DocsPageLinks page={pageRef} className="mt-6 border-t border-border pt-6 xl:hidden" />
      </article>
      <DocsRail page={pageRef} toc={page.data.full ? [] : page.data.toc} />
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
