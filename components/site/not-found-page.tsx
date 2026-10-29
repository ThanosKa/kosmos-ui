import { Button } from '@/registry/kosmos/ui/button';
import { FlickeringGrid } from '@/registry/kosmos/ui/flickering-grid';
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
      <main
        id="content"
        tabIndex={-1}
        className="@container relative isolate flex flex-1 flex-col items-center justify-center overflow-hidden px-4 py-24 text-center outline-none"
      >
        <FlickeringGrid spotlight className="mask-[radial-gradient(ellipse_50%_60%_at_50%_50%,black,transparent)]" />
        <KosmosMark className="mb-6 size-10" />
        <p className="text-display font-semibold tabular-nums @2xl:text-hero">404</p>
        <h1 className="mt-3 text-title">This page drifted out of orbit</h1>
        <p className="mt-2 max-w-[32em] text-body text-muted-foreground @2xl:text-lead">
          Nothing lives at{' '}
          <span className="font-mono break-all text-foreground">
            <CurrentPath />
          </span>
          . It may have moved, or the link has a typo.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          <Button variant="primary" size="lg" href="/docs/components">
            Browse components
          </Button>
          <Button variant="secondary" size="lg" href="/">
            Back to home
          </Button>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
