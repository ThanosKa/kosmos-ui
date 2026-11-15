'use client';

import { PromptComposer } from '@/registry/kosmos/ui/prompt-composer';

export default function PromptComposerStates() {
  return (
    <div className="flex w-full max-w-xl flex-col gap-6">
      <PromptComposer
        defaultValue="Summarize the attached export."
        error="copperline-raw-events.zip is over the 25 MB limit. Split it into smaller files and attach them again."
        onAttach={() => {}}
        onSubmit={() => {}}
      />
      <PromptComposer
        disabled
        disabledReason="Acme has used this month's agent budget. Lena Park can raise it in Settings."
        onAttach={() => {}}
        onSubmit={() => {}}
      />
    </div>
  );
}
