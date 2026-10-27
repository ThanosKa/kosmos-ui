import { Gauge } from '@/registry/kosmos/ui/gauge';

export default function GaugeDemo() {
  return <Gauge value={68} showValue aria-label="Profile completeness" />;
}
