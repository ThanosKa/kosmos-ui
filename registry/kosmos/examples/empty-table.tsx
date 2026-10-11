import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/registry/kosmos/ui/empty';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/registry/kosmos/ui/table';

export default function EmptyTable() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Invoice</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead className="text-end">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow className="hover:bg-transparent">
          <TableCell colSpan={3} className="h-auto whitespace-normal">
            <Empty>
              <EmptyHeader>
                <EmptyTitle>No invoices this month</EmptyTitle>
                <EmptyDescription>Invoices you send in October will be listed here.</EmptyDescription>
              </EmptyHeader>
            </Empty>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}
