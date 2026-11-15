'use client';

import * as React from 'react';
import { Pagination, PaginationNext, PaginationPages, PaginationPrevious } from '@/registry/kosmos/ui/pagination';

export default function PaginationDemo() {
  const [page, setPage] = React.useState(4);
  return (
    <Pagination page={page} onPageChange={setPage} pageCount={12}>
      <div className="flex items-center gap-1">
        <PaginationPrevious />
        <PaginationPages />
        <PaginationNext />
      </div>
    </Pagination>
  );
}
