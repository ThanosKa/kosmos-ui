'use client';

import { useState } from 'react';
import { PromptComposer } from '@/registry/kosmos/ui/prompt-composer';

export default function PromptComposerMinimal() {
  const [sent, setSent] = useState<string[]>([]);

  return (
    <div className="flex w-full max-w-xl flex-col gap-3">
      {sent.length > 0 ? (
        <ul aria-label="Sent messages" className="flex flex-col gap-1 px-2 text-body">
          {sent.map((text, index) => (
            <li key={index} className="break-words whitespace-pre-wrap">
              {text}
            </li>
          ))}
        </ul>
      ) : null}
      <PromptComposer placeholder="Write a note for the Acme team…" onSubmit={({ text }) => setSent([...sent, text])} />
    </div>
  );
}
