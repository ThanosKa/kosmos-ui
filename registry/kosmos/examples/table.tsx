import { PreviewSection, PreviewStack } from '@/components/preview/preview-section';
import { Button } from '@/registry/kosmos/ui/button';
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
  { id: 'INV-1042', customer: 'Northwind Traders', status: 'Paid', tone: 'bg-success', amount: 1250 },
  { id: 'INV-1043', customer: 'Acme Corporation', status: 'Pending', tone: 'bg-warning', amount: 980.5 },
  { id: 'INV-1044', customer: 'Globex', status: 'Overdue', tone: 'bg-destructive', amount: 12400 },
  { id: 'INV-1045', customer: 'Initech', status: 'Paid', tone: 'bg-success', amount: 75 },
];

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

function Status({ label, tone }: { label: string; tone: string }) {
  return (
    <span className="flex items-center gap-2">
      <span aria-hidden className={`size-1.5 rounded-full ${tone}`} />
      {label}
    </span>
  );
}

export default function TablePreview() {
  return (
    <PreviewStack>
      <PreviewSection title="Row states: default, hover, selected, focus inside">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>State</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead className="text-end">Amount</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="text-muted-foreground">default</TableCell>
              <TableCell>Northwind Traders</TableCell>
              <TableCell className="text-end">{money.format(1250)}</TableCell>
              <TableCell className="w-0 text-end">
                <Button variant="ghost" size="sm">
                  Open
                </Button>
              </TableCell>
            </TableRow>
            <TableRow data-preview="hover">
              <TableCell className="text-muted-foreground">hover</TableCell>
              <TableCell>Acme Corporation</TableCell>
              <TableCell className="text-end">{money.format(980.5)}</TableCell>
              <TableCell className="w-0 text-end">
                <Button variant="ghost" size="sm">
                  Open
                </Button>
              </TableCell>
            </TableRow>
            <TableRow data-state="selected">
              <TableCell className="text-muted-foreground">selected</TableCell>
              <TableCell>Globex</TableCell>
              <TableCell className="text-end">{money.format(12400)}</TableCell>
              <TableCell className="w-0 text-end">
                <Button variant="ghost" size="sm">
                  Open
                </Button>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="text-muted-foreground">focus</TableCell>
              <TableCell>Initech</TableCell>
              <TableCell className="text-end">{money.format(75)}</TableCell>
              <TableCell className="w-0 text-end">
                <Button variant="ghost" size="sm" data-preview="focus">
                  Open
                </Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </PreviewSection>

      <PreviewSection title="Invoices: status, numbers, footer and caption">
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
                <TableCell>
                  <Status label={invoice.status} tone={invoice.tone} />
                </TableCell>
                <TableCell className="text-end">{money.format(invoice.amount)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={3}>Total</TableCell>
              <TableCell className="text-end">
                {money.format(invoices.reduce((sum, invoice) => sum + invoice.amount, 0))}
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </PreviewSection>

      <PreviewSection title="Long text in a fixed column">
        <Table className="table-fixed">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[45%]">Company</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead className="w-24 text-end">Deals</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="truncate" title="International Business Machines Corporation, Europe, Middle East and Africa">
                International Business Machines Corporation, Europe, Middle East and Africa
              </TableCell>
              <TableCell className="truncate" title="Alexandra Konstantinidou-Papadopoulou">
                Alexandra Konstantinidou-Papadopoulou
              </TableCell>
              <TableCell className="text-end">1,204</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="truncate">Hooli</TableCell>
              <TableCell className="truncate">Gavin Belson</TableCell>
              <TableCell className="text-end">8</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </PreviewSection>

      <PreviewSection title="Wide table in a card: scrolls on narrow screens">
        <div className="rounded-2xl border border-transparent bg-card py-1 shadow-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Issued</TableHead>
                <TableHead>Due</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-end">Tax</TableHead>
                <TableHead className="text-end">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">{invoice.id}</TableCell>
                  <TableCell>{invoice.customer}</TableCell>
                  <TableCell>Oct 2, 2026</TableCell>
                  <TableCell>Nov 1, 2026</TableCell>
                  <TableCell>
                    <Status label={invoice.status} tone={invoice.tone} />
                  </TableCell>
                  <TableCell className="text-end">{money.format(invoice.amount * 0.24)}</TableCell>
                  <TableCell className="text-end">{money.format(invoice.amount)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </PreviewSection>
    </PreviewStack>
  );
}
