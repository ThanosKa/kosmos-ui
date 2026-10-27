import { Gauge } from '@/registry/kosmos/ui/gauge';

export default function GaugeSizes() {
  return (
    <div className="flex items-center gap-8">
      <Gauge size="xs" value={80} aria-label="Extra small gauge" />
      <Gauge size="sm" value={80} showValue aria-label="Small gauge" />
      <Gauge size="md" value={80} showValue aria-label="Medium gauge" />
      <Gauge size="lg" value={80} showValue aria-label="Large gauge" />
    </div>
  );
}
