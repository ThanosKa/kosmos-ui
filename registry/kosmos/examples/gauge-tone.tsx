import { Gauge } from '@/registry/kosmos/ui/gauge';

export default function GaugeTone() {
  return (
    <div className="flex items-center gap-8">
      <Gauge value={14} tone="auto" showValue aria-label="Lead score 14" />
      <Gauge value={48} tone="auto" showValue aria-label="Lead score 48" />
      <Gauge value={91} tone="auto" showValue aria-label="Lead score 91" />
      <Gauge value={91} tone="auto" optimum={0} showValue aria-label="Disk used 91" />
    </div>
  );
}
