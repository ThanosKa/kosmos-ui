'use client';

import * as React from 'react';
import { AssistantMessage } from '@/registry/kosmos/ui/assistant-message';

const reply =
  'Three projects are above 90% of their event quota: Checkout, Mobile and Partner API. The Growth team owns the first two, and the Platform team owns Partner API.';

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
        author={{ name: 'Acme agent' }}
        time="14:03"
        model="Claude Haiku 5.5"
        onRetry={() => setCount(0)}
      >
        {words.slice(0, count).join(' ')}
      </AssistantMessage>
    </div>
  );
}
