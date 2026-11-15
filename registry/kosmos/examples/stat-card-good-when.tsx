import { StatCard, StatCardDelta, StatCardLabel, StatCardValue } from '@/registry/kosmos/ui/stat-card';

export default function StatCardGoodWhen() {
  return (
    <div className="grid w-full max-w-xl grid-cols-1 gap-4 sm:grid-cols-2">
      <StatCard>
        <StatCardLabel>Error events</StatCardLabel>
        <StatCardValue>1.4%</StatCardValue>
        <StatCardDelta value={-0.5} unit="points" goodWhen="down">
          vs September
        </StatCardDelta>
      </StatCard>
      <StatCard>
        <StatCardLabel>Median session</StatCardLabel>
        <StatCardValue>4m 12s</StatCardValue>
        <StatCardDelta value={5.2} goodWhen="neither">
          vs September
        </StatCardDelta>
      </StatCard>
    </div>
  );
}
