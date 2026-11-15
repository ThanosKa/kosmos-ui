import type * as React from 'react';
import { cn } from '@/registry/kosmos/lib/cn';
import { ScrollArea } from '@/registry/kosmos/ui/scroll-area';

/**
 * A native `<table>` in a Kosmos `ScrollArea`, so a wide table scrolls on its own at 375px instead
 * of widening the page. While columns are hidden, the clipped edge fades out and a scrollbar shows
 * under the table, so the hidden columns never go unnoticed. Numbers line up: the whole table is
 * `tabular-nums`.
 */
function Table({ className, containerClassName, ...props }: React.ComponentProps<'table'> & { containerClassName?: string }) {
  return (
    <ScrollArea data-slot="table-container" className={cn('w-full', containerClassName)}>
      <table
        data-slot="table"
        className={cn('w-full caption-bottom border-collapse text-body tabular-nums', className)}
        {...props}
      />
    </ScrollArea>
  );
}

function TableHeader({ className, ...props }: React.ComponentProps<'thead'>) {
  return <thead data-slot="table-header" className={cn('[&_tr]:border-b [&_tr]:border-border [&_tr]:hover:bg-transparent', className)} {...props} />;
}

function TableBody({ className, ...props }: React.ComponentProps<'tbody'>) {
  return <tbody data-slot="table-body" className={cn('[&_tr:last-child]:border-b-0', className)} {...props} />;
}

function TableFooter({ className, ...props }: React.ComponentProps<'tfoot'>) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn('border-t border-border font-medium [&_tr]:hover:bg-transparent [&>tr]:last:border-b-0', className)}
      {...props}
    />
  );
}

/** Body rows highlight on hover. Mark a selected row with `data-state="selected"`, as shadcn's data table does. */
function TableRow({ className, ...props }: React.ComponentProps<'tr'>) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        'border-b border-border transition-[background-color] duration-instant',
        'hover:bg-accent data-[state=selected]:bg-muted',
        className,
      )}
      {...props}
    />
  );
}

function TableHead({ className, ...props }: React.ComponentProps<'th'>) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        'h-9.5 px-3 text-start align-middle text-caption font-normal whitespace-nowrap text-muted-foreground',
        className,
      )}
      {...props}
    />
  );
}

function TableCell({ className, ...props }: React.ComponentProps<'td'>) {
  return (
    <td data-slot="table-cell" className={cn('h-10.5 px-3 align-middle whitespace-nowrap', className)} {...props} />
  );
}

function TableCaption({ className, ...props }: React.ComponentProps<'caption'>) {
  return (
    <caption data-slot="table-caption" className={cn('mt-3 px-3 text-start text-small text-muted-foreground', className)} {...props} />
  );
}

export { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption };
