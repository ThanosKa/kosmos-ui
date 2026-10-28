'use client';

import * as React from 'react';
import { AssistantMessage } from '@/registry/kosmos/ui/assistant-message';

export default function AssistantMessageError() {
  const [failed, setFailed] = React.useState(true);

  return (
    <div className="w-full max-w-xl">
      {failed ? (
        <AssistantMessage
          status="error"
          error="The events export timed out."
          author={{ name: 'Acme agent', avatarUrl: '/logos/acme.svg' }}
          time="14:04"
          model="Claude Sonnet 5.5"
          onRetry={() => setFailed(false)}
        >
          Pulling events for the last 30 days
        </AssistantMessage>
      ) : (
        <AssistantMessage
          author={{ name: 'Acme agent', avatarUrl: '/logos/acme.svg' }}
          time="14:05"
          model="Claude Sonnet 5.5"
          onRetry={() => setFailed(true)}
        >
          Revenue for the last 30 days is $14,628 a month, up 6.8% on the 30 days before.
        </AssistantMessage>
      )}
    </div>
  );
}
