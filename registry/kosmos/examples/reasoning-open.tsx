import { Reasoning } from '@/registry/kosmos/ui/reasoning';

export default function ReasoningOpen() {
  return (
    <Reasoning status="done" durationMs={12000} defaultOpen className="max-w-md">
      Three projects are close to or over their event quota: Copperline Bank (109%), Cirrus Weather (80%) and Ironbark Logistics
      (79%). Copperline Bank passed its 8,000,000 allowance on the Scale plan, so Lena should see this first.
    </Reasoning>
  );
}
