import { Collapsible, CollapsibleChevron, CollapsibleContent, CollapsibleTrigger } from '@/registry/kosmos/ui/collapsible';

const projectDetails = [
  { label: 'Project', value: 'Cirrus Weather' },
  { label: 'Added', value: 'Mar 3, 2025' },
  { label: 'Platform', value: 'iOS' },
  { label: 'Events', value: '2,391,700' },
];

export default function CollapsibleDemo() {
  return (
    <Collapsible defaultOpen className="w-full max-w-sm rounded-2xl border border-transparent bg-card p-1 shadow-card">
      <CollapsibleTrigger variant="item" className="h-9 w-full justify-between px-2">
        Project details
        <CollapsibleChevron />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <dl className="flex flex-col gap-2 px-2 pt-1 pb-2 text-body">
          {projectDetails.map((item) => (
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
