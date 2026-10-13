'use client';

import { PromptComposer } from '@/registry/kosmos/ui/prompt-composer';

export default function PromptComposerStates() {
  return (
    <div className="flex w-full max-w-xl flex-col gap-6">
      <PromptComposer
        defaultValue="Summarize the attached export."
        error="checkout-raw-events.zip is over the 25 MB limit. Split it into smaller files and attach them again."
        onAttach={() => {}}
        onSubmit={() => {}}
      />
      <PromptComposer
        disabled
        disabledReason="Acme Inc. has used this month's agent budget. An admin can raise it in Settings."
        onAttach={() => {}}
        onSubmit={() => {}}
      />
    </div>
  );
}
