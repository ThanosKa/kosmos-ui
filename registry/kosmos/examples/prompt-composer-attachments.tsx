'use client';

import { useState } from 'react';
import { PromptComposer, type PromptComposerAttachment } from '@/registry/kosmos/ui/prompt-composer';

const files: PromptComposerAttachment[] = [
  { id: 'events', name: 'checkout-q3-events.csv', size: 2_400_000, kind: 'table' },
  { id: 'chart', name: 'retention-dashboard.png', size: 640_000, kind: 'image' },
  { id: 'brief', name: 'quarterly-review-brief.pdf', size: 1_100_000, kind: 'file' },
];

export default function PromptComposerAttachments() {
  const [attachments, setAttachments] = useState<PromptComposerAttachment[]>([files[0]]);
  const next = files.find((file) => !attachments.some((attached) => attached.id === file.id));

  return (
    <div className="w-full max-w-xl">
      <PromptComposer
        defaultValue="Compare these with last quarter."
        attachments={attachments}
        onAttachmentsChange={setAttachments}
        onAttach={() => {
          if (next) setAttachments([...attachments, next]);
        }}
        onSubmit={() => {}}
      />
    </div>
  );
}
