import { Gauge } from '@/registry/kosmos/ui/gauge';

export default function GaugeIndeterminate() {
  return (
    <div className="flex items-center gap-3">
      <Gauge indeterminate size="sm" aria-label="Calculating usage" />
      <span className="text-body text-muted-foreground">Calculating usage…</span>
    </div>
  );
}
