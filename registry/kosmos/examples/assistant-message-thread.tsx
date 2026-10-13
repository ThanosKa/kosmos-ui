'use client';

import { AssistantMessage } from '@/registry/kosmos/ui/assistant-message';

export default function AssistantMessageThread() {
  return (
    <div className="flex w-full max-w-xl flex-col gap-4">
      <AssistantMessage role="user">Which projects are close to their event quota?</AssistantMessage>
      <AssistantMessage author={{ name: 'Acme agent' }} time="14:02" model="Claude Sonnet 5.5" actionsVisibility="hover">
        Copperline Bank is over its monthly event quota at 109%. Cirrus Weather (80%) and Ironbark Logistics (79%) are close.
      </AssistantMessage>
      <AssistantMessage role="user">Which of them send from servers?</AssistantMessage>
      <AssistantMessage author={{ name: 'Acme agent' }} time="14:03" model="Claude Sonnet 5.5">
        Copperline Bank and Ironbark Logistics. Cirrus Weather sends from its iOS app.
      </AssistantMessage>
    </div>
  );
}
