'use client';

import { TriangleAlert } from 'lucide-react';
import Link from 'next/link';
import { Button, buttonVariants } from '@/registry/kosmos/ui/button';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/registry/kosmos/ui/empty';

/** What a page that failed to render shows in its place. */
export function PageError({ retry }: { retry: () => void }) {
  return (
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
  );
}
