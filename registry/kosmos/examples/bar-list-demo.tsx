import { BarList } from '@/registry/kosmos/ui/bar-list';

const compact = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 });

const events = [
  { name: 'page_viewed', count: 17410000 },
  { name: 'button_clicked', count: 5960000 },
  { name: 'screen_viewed', count: 4600000 },
  { name: 'signed_up', count: 389000 },
  { name: 'checkout_completed', count: 91200 },
];

export default function BarListDemo() {
  return (
    <BarList
      aria-label="Top events, last 30 days"
      items={events.map((event) => ({ id: event.name, label: <span className="font-mono">{event.name}</span>, value: event.count }))}
      format={compact.format}
      className="w-full max-w-sm"
    />
  );
}
