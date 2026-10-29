import { ErrorPage } from '@/registry/kosmos/blocks/error-page/error-page';
import { Button } from '@/registry/kosmos/ui/button';
import { CurrentPath } from './current-path';
import { KosmosMark } from './kosmos-mark';
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
        <ErrorPage
          media={<KosmosMark />}
          title="This page drifted out of orbit"
          description={
            <>
              Nothing lives at{' '}
              <span className="font-mono break-all text-foreground">
                <CurrentPath />
              </span>
              . It may have moved, or the link has a typo.
            </>
          }
          actions={
            <>
              <Button variant="primary" size="lg" href="/docs/components">
                Browse components
              </Button>
              <Button variant="secondary" size="lg" href="/">
                Back to home
              </Button>
            </>
          }
        />
      </main>
      <SiteFooter />
    </>
  );
}
