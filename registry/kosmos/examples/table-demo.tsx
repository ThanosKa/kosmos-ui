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
  { id: 'INV-1042', customer: 'Northwind Traders', status: 'Paid', amount: 1250 },
  { id: 'INV-1043', customer: 'Acme Corporation', status: 'Pending', amount: 980.5 },
  { id: 'INV-1044', customer: 'Globex', status: 'Overdue', amount: 12400 },
  { id: 'INV-1045', customer: 'Initech', status: 'Paid', amount: 75 },
];

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

export default function TableDemo() {
  return (
    <Table>
      <TableCaption>Invoices issued in October.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Invoice</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-end">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices.map((invoice) => (
          <TableRow key={invoice.id}>
            <TableCell className="font-medium">{invoice.id}</TableCell>
            <TableCell>{invoice.customer}</TableCell>
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
