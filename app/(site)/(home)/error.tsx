'use client';

import { PageError } from '@/components/site/page-error';

export default function Error({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <main className="flex flex-1 flex-col">
      <PageError retry={retry} />
    </main>
  );
}
