import { Collapsible, CollapsibleChevron, CollapsibleContent, CollapsibleTrigger } from '@/registry/kosmos/ui/collapsible';

const orderDetails = [
  { label: 'Order', value: '#10428' },
  { label: 'Placed', value: 'Oct 12, 2026' },
  { label: 'Ship to', value: 'Acme Inc., Warehouse 3' },
  { label: 'Total', value: '$1,284.00' },
];

export default function CollapsibleDemo() {
  return (
    <Collapsible defaultOpen className="w-full max-w-sm rounded-2xl border border-transparent bg-card p-1 shadow-card">
      <CollapsibleTrigger variant="item" className="h-9 w-full justify-between px-2">
        Order details
        <CollapsibleChevron />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <dl className="flex flex-col gap-2 px-2 pt-1 pb-2 text-body">
          {orderDetails.map((item) => (
            <div key={item.label} className="flex justify-between gap-4">
              <dt className="text-muted-foreground">{item.label}</dt>
              <dd className="text-end tabular-nums">{item.value}</dd>
            </div>
          ))}
        </dl>
      </CollapsibleContent>
    </Collapsible>
  );
}
