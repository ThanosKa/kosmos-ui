import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/registry/kosmos/ui/table';

const invoices = [
  { id: 'INV-1042', project: 'Fernhill Books', status: 'Paid', amount: 2400 },
  { id: 'INV-1043', project: 'Brightloop Fitness', status: 'Pending', amount: 3600 },
  { id: 'INV-1044', project: 'Copperline Bank', status: 'Overdue', amount: 4800 },
  { id: 'INV-1045', project: 'Saltmarsh Coffee', status: 'Paid', amount: 149 },
];

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

export default function TableDemo() {
  return (
    <Table>
      <TableCaption>Invoices issued in October.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Invoice</TableHead>
          <TableHead>Project</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-end">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices.map((invoice) => (
          <TableRow key={invoice.id}>
            <TableCell className="font-medium">{invoice.id}</TableCell>
            <TableCell>{invoice.project}</TableCell>
            <TableCell>{invoice.status}</TableCell>
            <TableCell className="text-end">{money.format(invoice.amount)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={3}>Total</TableCell>
          <TableCell className="text-end">{money.format(invoices.reduce((sum, invoice) => sum + invoice.amount, 0))}</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  );
}
