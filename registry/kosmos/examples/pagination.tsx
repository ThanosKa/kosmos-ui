'use client';

import * as React from 'react';
import { PreviewSection, PreviewStack } from '@/components/preview/preview-section';
import { StateMatrix, previewState } from '@/components/preview/state-matrix';
import {
  Pagination,
  PaginationLink,
  PaginationLoadMore,
  PaginationNext,
  PaginationPageSize,
  PaginationPages,
  PaginationPrevious,
  PaginationStatus,
} from '@/registry/kosmos/ui/pagination';

const pages = ['page', 'current page'] as const;
const steps = ['previous', 'next', 'previous with label', 'next with label'] as const;
const pageStates = ['default', 'hover', 'focus', 'active'] as const;

function Page({ current, state }: { current: boolean; state: string }) {
  return (
    <Pagination page={current ? 4 : 1} pageCount={12}>
      <PaginationLink page={4} {...previewState(state)} />
    </Pagination>
  );
}

function Step({ part, state }: { part: (typeof steps)[number]; state: string }) {
  const { disabled, ...preview } = previewState(state);
  const label = part.endsWith('with label');
  const previous = part.startsWith('previous');
  const page = disabled ? (previous ? 1 : 12) : 6;
  return (
    <Pagination page={page} pageCount={12}>
      {previous ? (
        <PaginationPrevious {...preview}>{label ? 'Previous' : null}</PaginationPrevious>
      ) : (
        <PaginationNext {...preview}>{label ? 'Next' : null}</PaginationNext>
      )}
    </Pagination>
  );
}

const ranges = [
  [1, 20],
  [4, 20],
  [5, 20],
  [10, 20],
  [17, 20],
  [20, 20],
  [3, 5],
  [1, 1],
  [120, 245],
] as const;

function Controlled({ children, ...props }: Omit<React.ComponentProps<typeof Pagination>, 'page' | 'onPageChange'> & { initialPage: number }) {
  const { initialPage, ...rest } = props;
  const [page, setPage] = React.useState(initialPage);
  return (
    <Pagination page={page} onPageChange={setPage} {...rest}>
      {children}
    </Pagination>
  );
}

function TableFooter({ total, initialPage, narrow = false }: { total: number; initialPage: number; narrow?: boolean }) {
  return (
    <div className={narrow ? 'w-80 max-w-full' : 'w-full max-w-3xl'}>
      <div className="rounded-2xl border border-transparent bg-card px-4 py-1.5 shadow-card">
        <Controlled initialPage={initialPage} total={total} defaultPageSize={10} className="justify-between">
          <PaginationPageSize />
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <PaginationStatus />
            <div className="flex items-center gap-1">
              <PaginationPrevious />
              <PaginationNext />
            </div>
          </div>
        </Controlled>
      </div>
    </div>
  );
}

function LoadMoreCase({ shown, total, loading = false }: { shown: number; total: number; loading?: boolean }) {
  const [count, setCount] = React.useState(shown);
  return <PaginationLoadMore shown={count} total={total} loading={loading} onLoadMore={() => setCount((c) => Math.min(total, c + 20))} />;
}

export default function PaginationPreview() {
  return (
    <PreviewStack>
      <PreviewSection title="Pages × states">
        <StateMatrix rows={pages} states={pageStates} render={(row, state) => <Page current={row === 'current page'} state={state} />} />
      </PreviewSection>

      <PreviewSection title="Steps × states (disabled: at the end of the list)">
        <StateMatrix rows={steps} render={(part, state) => <Step part={part} state={state} />} />
      </PreviewSection>

      <PreviewSection title="Pages: the row keeps its length">
        <ul className="flex flex-col gap-3">
          {ranges.map(([page, pageCount]) => (
            <li key={`${page}-${pageCount}`} className="flex flex-col items-start gap-1.5">
              <span className="font-mono text-caption text-muted-foreground">
                page {page} of {pageCount}
              </span>
              <Controlled initialPage={page} pageCount={pageCount}>
                <div className="flex items-center gap-1">
                  <PaginationPrevious />
                  <PaginationPages />
                  <PaginationNext />
                </div>
              </Controlled>
            </li>
          ))}
        </ul>
      </PreviewSection>

      <PreviewSection title="Links with labels">
        <Controlled initialPage={2} pageCount={8} getPageHref={(page) => `#page-${page}`}>
          <div className="flex items-center gap-1">
            <PaginationPrevious>Previous</PaginationPrevious>
            <PaginationPages siblings={0} />
            <PaginationNext>Next</PaginationNext>
          </div>
        </Controlled>
      </PreviewSection>

      <PreviewSection title="Table footer: rows per page, rows in view, steps">
        <TableFooter total={2450} initialPage={3} />
        <TableFooter total={1_284_906} initialPage={128_491} />
        <TableFooter total={0} initialPage={1} />
        <Controlled initialPage={3} pageCount={12}>
          <PaginationStatus />
          <div className="flex items-center gap-1">
            <PaginationPrevious />
            <PaginationNext />
          </div>
        </Controlled>
      </PreviewSection>

      <PreviewSection title="Narrow: 320px">
        <TableFooter total={2450} initialPage={3} narrow />
      </PreviewSection>

      <PreviewSection title="Load more">
        <div className="grid grid-cols-[repeat(auto-fill,minmax(14rem,1fr))] gap-6">
          <LoadMoreCase shown={20} total={134} />
          <LoadMoreCase shown={20} total={134} loading />
          <LoadMoreCase shown={134} total={134} />
          <LoadMoreCase shown={20} total={1_284_906} />
        </div>
      </PreviewSection>

      <PreviewSection title="Another language">
        <Controlled initialPage={3} total={2450} className="justify-between">
          <PaginationPageSize label="Zeilen pro Seite" />
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <PaginationStatus>
              {({ from, to, total }) => `${from}–${to} von ${(total ?? 0).toLocaleString('de-DE')}`}
            </PaginationStatus>
            <div className="flex items-center gap-1">
              <PaginationPrevious aria-label="Vorherige Seite" />
              <PaginationNext aria-label="Nächste Seite" />
            </div>
          </div>
        </Controlled>
      </PreviewSection>
    </PreviewStack>
  );
}
