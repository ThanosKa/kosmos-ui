import { FileQuestion } from 'lucide-react';
import Link from 'next/link';
import { buttonVariants } from '@/registry/kosmos/ui/button';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/registry/kosmos/ui/empty';
import { SiteFooter } from './site-footer';
import { SiteHeader } from './site-header';
import { SkipLink } from './skip-link';

/** The 404 page in the site chrome, for a missing docs page and for a URL no route matches. */
export function NotFoundPage() {
  return (
    <>
      <SkipLink />
      <SiteHeader />
      <main id="content" tabIndex={-1} className="flex flex-1 flex-col outline-none">
        <Empty className="py-24">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FileQuestion />
            </EmptyMedia>
            <EmptyTitle render={<h1 />}>Page not found</EmptyTitle>
            <EmptyDescription>
              The link may be out of date or have a typo. Search the docs from the header, or start from the docs home.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Link href="/docs" className={buttonVariants({ variant: 'secondary' })}>
              Go to the docs
            </Link>
            <Link href="/" className={buttonVariants({ variant: 'ghost' })}>
              Go to the home page
            </Link>
          </EmptyContent>
        </Empty>
      </main>
      <SiteFooter />
    </>
  );
}
