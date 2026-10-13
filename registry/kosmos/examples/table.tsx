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
  { id: 'INV-1042', project: 'Fernhill Books', status: 'Paid', tone: 'bg-success', amount: 2400 },
  { id: 'INV-1043', project: 'Brightloop Fitness', status: 'Pending', tone: 'bg-warning', amount: 3600 },
  { id: 'INV-1044', project: 'Copperline Bank', status: 'Overdue', tone: 'bg-destructive', amount: 4800 },
  { id: 'INV-1045', project: 'Saltmarsh Coffee', status: 'Paid', tone: 'bg-success', amount: 149 },
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
              <TableHead>Project</TableHead>
              <TableHead className="text-end">Amount</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="text-muted-foreground">default</TableCell>
              <TableCell>Fernhill Books</TableCell>
              <TableCell className="text-end">{money.format(2400)}</TableCell>
              <TableCell className="w-0 text-end">
                <Button variant="ghost" size="sm">
                  Open
                </Button>
              </TableCell>
            </TableRow>
            <TableRow data-preview="hover">
              <TableCell className="text-muted-foreground">hover</TableCell>
              <TableCell>Brightloop Fitness</TableCell>
              <TableCell className="text-end">{money.format(3600)}</TableCell>
              <TableCell className="w-0 text-end">
                <Button variant="ghost" size="sm">
                  Open
                </Button>
              </TableCell>
            </TableRow>
            <TableRow data-state="selected">
              <TableCell className="text-muted-foreground">selected</TableCell>
              <TableCell>Copperline Bank</TableCell>
              <TableCell className="text-end">{money.format(4800)}</TableCell>
              <TableCell className="w-0 text-end">
                <Button variant="ghost" size="sm">
                  Open
                </Button>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="text-muted-foreground">focus</TableCell>
              <TableCell>Saltmarsh Coffee</TableCell>
              <TableCell className="text-end">{money.format(149)}</TableCell>
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
              <TableHead className="w-[45%]">Project</TableHead>
              <TableHead>Domain</TableHead>
              <TableHead className="w-24 text-end">Users</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="truncate" title="Copperline Bank server events for card payments, loans and the business portal">
                Copperline Bank server events for card payments, loans and the business portal
              </TableCell>
              <TableCell className="truncate" title="payments-gateway.eu-west.copperline.example">
                payments-gateway.eu-west.copperline.example
              </TableCell>
              <TableCell className="text-end">12,940</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="truncate">Kiln Studio</TableCell>
              <TableCell className="truncate">kiln.example</TableCell>
              <TableCell className="text-end">120</TableCell>
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
                <TableHead>Project</TableHead>
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
                  <TableCell>{invoice.project}</TableCell>
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
