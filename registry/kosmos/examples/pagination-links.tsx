'use client';

import * as React from 'react';
import { Pagination, PaginationNext, PaginationPages, PaginationPrevious } from '@/registry/kosmos/ui/pagination';

export default function PaginationLinks() {
  const [page, setPage] = React.useState(1);
  return (
    <Pagination page={page} onPageChange={setPage} pageCount={8} getPageHref={(target) => `#page-${target}`}>
      <div className="flex items-center gap-1">
        <PaginationPrevious>Previous</PaginationPrevious>
        <PaginationPages />
        <PaginationNext>Next</PaginationNext>
      </div>
    </Pagination>
  );
}
