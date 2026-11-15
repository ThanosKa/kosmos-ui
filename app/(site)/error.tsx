'use client';

import { PageError } from '@/components/site/page-error';

/** An error in a layout, which takes the site header down with it. Errors in a page show inside the header and footer. */
export default function Error({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <main id="content" tabIndex={-1} className="flex flex-1 flex-col outline-none">
      <PageError retry={retry} />
    </main>
  );
}
