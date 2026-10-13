import { Reasoning } from '@/registry/kosmos/ui/reasoning';

export default function ReasoningOpen() {
  return (
    <Reasoning status="done" durationMs={12000} defaultOpen className="max-w-md">
      Acme Inc. has 14 projects. Three are above 90% of their event quota: Checkout, Mobile and Partner API. The plan
      renews in November, so the Admin should see this before the renewal call.
    </Reasoning>
  );
}
