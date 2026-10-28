import { PreviewSection, PreviewStack } from '@/components/preview/preview-section';
import { BarList } from '@/registry/kosmos/ui/bar-list';

const compact = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 });
const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

const events = [
  { name: 'page_viewed', count: 17410000 },
  { name: 'button_clicked', count: 5960000 },
  { name: 'screen_viewed', count: 4600000 },
  { name: 'signed_up', count: 389000 },
  { name: 'checkout_completed', count: 91200 },
  { name: 'invite_sent', count: 45000 },
];
const topEvents = events.map((event) => ({ id: event.name, label: <span className="font-mono">{event.name}</span>, value: event.count }));

const usersByPlan = [
  { label: 'Scale', meta: '4 projects', value: 97410 },
  { label: 'Pro', meta: '6 projects', value: 46230 },
  { label: 'Free', meta: '2 projects', value: 960 },
];

const revenueByPlan = [
  { label: 'Scale', value: 13700 },
  { label: 'Pro', value: 928 },
  { label: 'Free', value: 0 },
];

const topProjects = [
  { label: 'Copperline Bank', value: 8730100 },
  { label: 'Ironbark Logistics', value: 6342900 },
  { label: 'Brightloop Fitness', value: 5204800 },
  { label: 'Fernhill Books', value: 3912400 },
  { label: 'Cirrus Weather', value: 2391700 },
];

const worstCase = [
  { label: 'Monthly active users across every workspace in the organization', meta: 'Scale plan, 4 projects', value: 1284903772 },
  { label: '/docs/dashboards/share/links/with-a-very-long-unbreakable-path-segment', value: 48210 },
  { label: 'Ιστότοπος καφέ Saltmarsh 🌊', meta: 'ΕΛ', value: 6120 },
  { label: 'K', value: 1 },
];

const ties = [
  { label: 'Fernhill Books', value: 48210 },
  { label: 'Driftwood Travel', value: 48210 },
  { label: 'Kiln Studio', value: 120 },
];

const allZero = [
  { label: 'Hollow Oak Games', value: 0 },
  { label: 'Kiln Studio', value: 0 },
];

export default function BarListPreview() {
  return (
    <PreviewStack>
      <div className="grid gap-10 md:grid-cols-2">
        <PreviewSection title="Default format, mono labels">
          <BarList aria-label="Top events" items={topEvents} format={(value) => compact.format(value)} />
        </PreviewSection>

        <PreviewSection title="Meta and share">
          <BarList aria-label="Active users by plan" items={usersByPlan} showShare />
        </PreviewSection>

        <PreviewSection title="Currency, with a zero value">
          <BarList aria-label="Monthly revenue by plan" items={revenueByPlan} format={(value) => usd.format(value)} />
        </PreviewSection>

        <PreviewSection title="Top 5 of a larger total">
          <BarList
            aria-label="Top projects by events"
            items={topProjects}
            format={(value) => compact.format(value)}
            showShare
            total={28495200}
          />
        </PreviewSection>

        <PreviewSection title="Worst case at 320px">
          <BarList aria-label="Worst case" items={worstCase} showShare className="max-w-80" />
        </PreviewSection>

        <PreviewSection title="Right to left">
          <div dir="rtl">
            <BarList aria-label="Active users by plan" items={usersByPlan} showShare />
          </div>
        </PreviewSection>

        <PreviewSection title="A tie, then all zero">
          <div className="flex flex-col gap-6">
            <BarList aria-label="Tie" items={ties} />
            <BarList aria-label="All zero" items={allZero} showShare />
          </div>
        </PreviewSection>

        <PreviewSection title="One row, then empty">
          <div className="flex flex-col gap-6">
            <BarList aria-label="One row" items={[{ label: 'Cirrus Weather', value: 22560 }]} showShare />
            <BarList items={[]} empty="No events in this range" />
          </div>
        </PreviewSection>
      </div>

      <PreviewSection title="In a card">
        <div className="flex max-w-sm flex-col gap-3 rounded-2xl border border-transparent bg-card p-3 shadow-card">
          <h3 id="bar-list-card-title" className="px-1 pt-1 text-title">
            Top events
          </h3>
          <BarList aria-labelledby="bar-list-card-title" items={topEvents.slice(0, 5)} format={(value) => compact.format(value)} />
        </div>
      </PreviewSection>
    </PreviewStack>
  );
}
