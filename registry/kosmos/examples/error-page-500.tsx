'use client';

import { ErrorPage } from '@/registry/kosmos/blocks/error-page/error-page';
import { Button } from '@/registry/kosmos/ui/button';

export default function ErrorPage500() {
  return (
    <div className="flex min-h-[36rem] w-full flex-col">
      <ErrorPage
        code="500"
        title="Something went wrong on our side"
        description="We couldn’t load this page. Try again in a moment, or check the status page."
        actions={
          <>
            <Button variant="primary" size="lg" onClick={() => {}}>
              Try again
            </Button>
            <Button variant="secondary" size="lg" href="https://status.acme.example">
              Status page
            </Button>
          </>
        }
      />
    </div>
  );
}
