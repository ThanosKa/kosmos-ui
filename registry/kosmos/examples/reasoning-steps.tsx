import { Reasoning } from '@/registry/kosmos/ui/reasoning';

export default function ReasoningSteps() {
  return (
    <Reasoning
      status="thinking"
      className="max-w-md"
      steps={[
        { label: 'Read the last 30 days of events', done: true },
        { label: 'Compare quota use across projects', done: true },
        { label: 'Draft the summary for Lena', done: false },
        { label: 'Suggest an allowance for each project', done: false },
      ]}
    />
  );
}
