import { CheckIcon } from 'lucide-react';
import { Gauge } from '@/registry/kosmos/ui/gauge';

export default function GaugeContent() {
  return (
    <div className="flex items-center gap-8">
      <Gauge
        value={3}
        max={5}

        tone="success"
        aria-label="3 of 5 steps done"
        showValue
      />
      <Gauge value={100} tone="success" aria-label="Setup complete">
        <CheckIcon aria-hidden className="size-5" />
      </Gauge>
    </div>
  );
}
