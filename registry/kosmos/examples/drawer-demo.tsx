import { Button } from '@/registry/kosmos/ui/button';
import {
  Drawer,
  DrawerBody,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/registry/kosmos/ui/drawer';

const details = [
  ['Status', 'In progress'],
  ['Owner', 'Ana Lopez'],
  ['Due', 'Oct 24'],
  ['Estimate', '3 days'],
] as const;

export default function DrawerDemo() {
  return (
    <Drawer>
      <DrawerTrigger render={<Button variant="secondary" />}>Open task</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Sync invoices with the ledger</DrawerTitle>
          <DrawerDescription>Billing revamp · created by Farah Haddad</DrawerDescription>
        </DrawerHeader>
        <DrawerBody>
          <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2">
            {details.map(([term, value]) => (
              <div key={term} className="contents">
                <dt className="text-muted-foreground">{term}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        </DrawerBody>
        <DrawerFooter>
          <DrawerClose render={<Button variant="primary" />}>Mark as done</DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
