import { Button } from '@/registry/kosmos/ui/button';
import { Panel, PanelContent, PanelDescription, PanelFooter, PanelHeader, PanelTitle } from '@/registry/kosmos/ui/panel';

const events = [
  { name: 'page_viewed', count: '17.4M' },
  { name: 'button_clicked', count: '6M' },
  { name: 'screen_viewed', count: '4.6M' },
  { name: 'signed_up', count: '389K' },
  { name: 'checkout_completed', count: '91.2K' },
];

export default function PanelList() {
  return (
    <Panel className="w-full max-w-sm">
      <PanelHeader>
        <PanelTitle>Top events</PanelTitle>
        <PanelDescription>Last 30 days, every project</PanelDescription>
      </PanelHeader>
      <PanelContent>
        <ul role="list" className="flex flex-col divide-y divide-border">
          {events.map((event) => (
            <li key={event.name} className="flex min-w-0 items-center justify-between gap-3 px-4 py-2.5 text-body">
              <span className="truncate font-mono">{event.name}</span>
              <span className="shrink-0 text-muted-foreground tabular-nums">{event.count}</span>
            </li>
          ))}
        </ul>
      </PanelContent>
      <PanelFooter>
        <Button variant="secondary" className="w-full">
          View all events
        </Button>
      </PanelFooter>
    </Panel>
  );
}
