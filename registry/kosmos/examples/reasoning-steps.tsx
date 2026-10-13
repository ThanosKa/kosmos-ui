import { Reasoning } from '@/registry/kosmos/ui/reasoning';

export default function ReasoningSteps() {
  return (
    <Reasoning
      status="thinking"
      className="max-w-md"
      steps={[
        { label: 'Read the Q3 event totals', done: true },
        { label: 'Compare quota use across projects', done: true },
        { label: 'Draft the summary for the Admin', done: false },
        { label: 'Suggest a new quota for each project', done: false },
      ]}
    />
  );
}
