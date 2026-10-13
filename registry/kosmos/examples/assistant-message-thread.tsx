'use client';

import { AssistantMessage } from '@/registry/kosmos/ui/assistant-message';

export default function AssistantMessageThread() {
  return (
    <div className="flex w-full max-w-xl flex-col gap-4">
      <AssistantMessage role="user">Which projects are close to their event quota?</AssistantMessage>
      <AssistantMessage author={{ name: 'Acme agent' }} time="14:02" model="Claude Sonnet 5.5" actionsVisibility="hover">
        Checkout, Mobile and Partner API are above 90% of their monthly event quota.
      </AssistantMessage>
      <AssistantMessage role="user">Who owns them?</AssistantMessage>
      <AssistantMessage author={{ name: 'Acme agent' }} time="14:03" model="Claude Sonnet 5.5">
        The Growth team owns Checkout and Mobile. Partner API belongs to the Platform team.
      </AssistantMessage>
    </div>
  );
}
