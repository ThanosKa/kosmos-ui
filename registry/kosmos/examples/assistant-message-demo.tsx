'use client';

import { AssistantMessage, Citation, type Source } from '@/registry/kosmos/ui/assistant-message';

const sources: Source[] = [
  { id: 'usage', title: 'Acme · Events by project, last 30 days', url: '#usage', domain: 'acme.example' },
  { id: 'quota', title: 'Event allowance by plan', url: '#quota', domain: 'docs.acme.example' },
];

export default function AssistantMessageDemo() {
  return (
    <div className="flex w-full max-w-xl flex-col gap-4">
      <AssistantMessage role="user">How many events did Acme collect in the last 30 days?</AssistantMessage>
      <AssistantMessage
        author={{ name: 'Acme agent' }}
        time="14:02"
        model="Claude Sonnet 5.5"
        sources={sources}
        followUps={['Show the three projects', 'Draft a note for Tomás Ortega']}
      >
        Acme collected 28,495,200 events in the last 30 days, 14.2% more than the 30 days before<Citation n={1} source={sources[0]} />.
        Three projects are close to or over their event quota<Citation n={2} source={sources[1]} />.
      </AssistantMessage>
    </div>
  );
}
