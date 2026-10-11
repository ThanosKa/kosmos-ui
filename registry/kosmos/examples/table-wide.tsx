import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/registry/kosmos/ui/table';

const rows = [
  { id: 'INV-1042', customer: 'Northwind Traders', issued: 'Oct 2, 2026', due: 'Nov 1, 2026', tax: 300, amount: 1250 },
  { id: 'INV-1043', customer: 'Acme Corporation', issued: 'Oct 4, 2026', due: 'Nov 3, 2026', tax: 235.32, amount: 980.5 },
  { id: 'INV-1044', customer: 'Globex', issued: 'Oct 9, 2026', due: 'Nov 8, 2026', tax: 2976, amount: 12400 },
];

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

export default function TableWide() {
  return (
    <div className="w-full max-w-md rounded-2xl border border-transparent bg-card py-1 shadow-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Invoice</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Issued</TableHead>
            <TableHead>Due</TableHead>
            <TableHead className="text-end">Tax</TableHead>
            <TableHead className="text-end">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              <TableCell className="font-medium">{row.id}</TableCell>
              <TableCell>{row.customer}</TableCell>
              <TableCell>{row.issued}</TableCell>
              <TableCell>{row.due}</TableCell>
              <TableCell className="text-end">{money.format(row.tax)}</TableCell>
              <TableCell className="text-end">{money.format(row.amount)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
