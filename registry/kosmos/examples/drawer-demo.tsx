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
  ['Assignee', 'Tomás Ortega'],
  ['Target', 'Q4 2026'],
  ['Votes', '45'],
] as const;

export default function DrawerDemo() {
  return (
    <Drawer>
      <DrawerTrigger render={<Button variant="secondary" />}>Open roadmap item</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Server-side batching</DrawerTitle>
          <DrawerDescription>Ingestion · added by Lena Park</DrawerDescription>
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
          <DrawerClose render={<Button variant="primary" />}>Mark as shipped</DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
