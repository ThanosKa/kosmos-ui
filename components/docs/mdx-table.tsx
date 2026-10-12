import type { ComponentProps } from 'react';
import { cn } from '@/registry/kosmos/lib/cn';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/registry/kosmos/ui/table';
import { inlineProseClass, tableCardClass } from './classes';

/** A Markdown table as a Kosmos Table on a card. Cells wrap, except the first column, which usually names a class or prop. */
export function MdxTable({ className, ...props }: ComponentProps<'table'>) {
  return (
    <div className={cn(tableCardClass, 'overflow-hidden', inlineProseClass)}>
      <Table containerClassName="rounded-none" className={className} {...props} />
    </div>
  );
}

export const MdxTableHeader = TableHeader;
export const MdxTableBody = TableBody;

export function MdxTableRow({ className, ...props }: ComponentProps<'tr'>) {
  return <TableRow className={cn('hover:bg-transparent', className)} {...props} />;
}

export function MdxTableHead({ className, ...props }: ComponentProps<'th'>) {
  return <TableHead className={cn('first:ps-4 last:pe-4', className)} {...props} />;
}

export function MdxTableCell({ className, ...props }: ComponentProps<'td'>) {
  return (
    <TableCell
      className={cn('h-auto min-w-40 py-2.5 align-top whitespace-normal text-pretty first:ps-4 first:whitespace-nowrap last:pe-4', className)}
      {...props}
    />
  );
}
