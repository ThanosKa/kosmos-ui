'use client';

import * as React from 'react';
import {
  Pagination,
  PaginationNext,
  PaginationPageSize,
  PaginationPrevious,
  PaginationStatus,
} from '@/registry/kosmos/ui/pagination';

export default function PaginationTable() {
  const [page, setPage] = React.useState(3);
  const [pageSize, setPageSize] = React.useState(10);
  return (
    <Pagination
      page={page}
      onPageChange={setPage}
      total={2450}
      pageSize={pageSize}
      onPageSizeChange={setPageSize}
      className="w-full max-w-2xl justify-between"
    >
      <PaginationPageSize />
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <PaginationStatus />
        <div className="flex items-center gap-1">
          <PaginationPrevious />
          <PaginationNext />
        </div>
      </div>
    </Pagination>
  );
}
