'use client';

import { ErrorPage } from '@/registry/kosmos/blocks/error-page/error-page';
import { Button } from '@/registry/kosmos/ui/button';
import { KosmosMark } from './kosmos-mark';

/** What a page that failed to render shows in its place. */
export function PageError({ retry }: { retry: () => void }) {
  return (
    <ErrorPage
      code="500"
      media={<KosmosMark />}
      title="This page didn’t load"
      description="An error stopped it from rendering. Try again, or start from the docs home."
      actions={
        <>
          <Button variant="primary" size="lg" onClick={() => retry()}>
            Try again
          </Button>
          <Button variant="secondary" size="lg" href="/docs">
            Go to the docs
          </Button>
        </>
      }
    />
  );
}
