'use client';

import { TriangleAlert } from 'lucide-react';
import Link from 'next/link';
import { Button, buttonVariants } from '@/registry/kosmos/ui/button';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/registry/kosmos/ui/empty';

export default function Error({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <main id="content" tabIndex={-1} className="flex flex-1 flex-col outline-none">
      <Empty className="py-24">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <TriangleAlert />
          </EmptyMedia>
          <EmptyTitle render={<h1 />}>This page didn’t load</EmptyTitle>
          <EmptyDescription>An error stopped it from rendering. Try again, or start from the docs home.</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button variant="secondary" onClick={() => retry()}>
            Try again
          </Button>
          <Link href="/docs" className={buttonVariants({ variant: 'ghost' })}>
            Go to the docs
          </Link>
        </EmptyContent>
      </Empty>
    </main>
  );
}
