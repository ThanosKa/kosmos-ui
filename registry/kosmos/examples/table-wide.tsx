import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/registry/kosmos/ui/table';

const rows = [
  { id: 'INV-1042', project: 'Fernhill Books', issued: 'Oct 2, 2026', due: 'Nov 1, 2026', tax: 576, amount: 2400 },
  { id: 'INV-1043', project: 'Brightloop Fitness', issued: 'Oct 4, 2026', due: 'Nov 3, 2026', tax: 864, amount: 3600 },
  { id: 'INV-1044', project: 'Copperline Bank', issued: 'Oct 9, 2026', due: 'Nov 8, 2026', tax: 1152, amount: 4800 },
];

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

export default function TableWide() {
  return (
    <div className="w-full max-w-md rounded-2xl border border-transparent bg-card py-1 shadow-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Invoice</TableHead>
            <TableHead>Project</TableHead>
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
              <TableCell>{row.project}</TableCell>
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
