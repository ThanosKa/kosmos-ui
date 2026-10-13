'use client';

import { AssistantMessage, Citation, type Source } from '@/registry/kosmos/ui/assistant-message';

const sources: Source[] = [
  { id: 'usage', title: 'Acme Inc. · Q3 usage export', url: '#usage', domain: 'acme.example' },
  { id: 'quota', title: 'Quota policy for event ingestion', url: '#quota', domain: 'docs.acme.example' },
];

export default function AssistantMessageDemo() {
  return (
    <div className="flex w-full max-w-xl flex-col gap-4">
      <AssistantMessage role="user">How many events did Acme Inc. ingest in Q3?</AssistantMessage>
      <AssistantMessage
        author={{ name: 'Acme agent' }}
        time="14:02"
        model="Claude Sonnet 5.5"
        sources={sources}
        followUps={['Show the three projects', 'Draft a note to the Data team']}
      >
        The Acme Inc. workspace tracked 48,210 events in Q3, 18% more than Q2<Citation n={1} source={sources[0]} />.
        Three projects are above 90% of quota<Citation n={2} source={sources[1]} />.
      </AssistantMessage>
    </div>
  );
}
