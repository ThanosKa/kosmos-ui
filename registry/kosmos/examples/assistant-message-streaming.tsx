'use client';

import * as React from 'react';
import { AssistantMessage } from '@/registry/kosmos/ui/assistant-message';

const reply =
  'Three projects are close to or over their event quota: Copperline Bank, Cirrus Weather and Ironbark Logistics. Copperline Bank and Ironbark Logistics send from servers, and Cirrus Weather from its iOS app.';

const words = reply.split(' ');

export default function AssistantMessageStreaming() {
  const [count, setCount] = React.useState(0);
  const status = count < words.length ? 'streaming' : 'done';

  React.useEffect(() => {
    if (count >= words.length) return;
    const timer = window.setTimeout(() => setCount((current) => current + 1), 60);
    return () => window.clearTimeout(timer);
  }, [count]);

  return (
    <div className="w-full max-w-xl">
      <AssistantMessage
        status={status}
        author={{ name: 'Acme agent', avatarUrl: '/logos/acme.svg' }}
        time="14:03"
        model="Claude Haiku 5.5"
        onRetry={() => setCount(0)}
      >
        {words.slice(0, count).join(' ')}
      </AssistantMessage>
    </div>
  );
}
