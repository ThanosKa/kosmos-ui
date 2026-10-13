'use client';

import { useEffect, useRef, useState } from 'react';
import type { ModelEffort, ModelOption } from '@/registry/kosmos/ui/model-select';
import { PromptComposer, type PromptComposerStatus } from '@/registry/kosmos/ui/prompt-composer';

const models: ModelOption[] = [
  { id: 'claude-opus-5-5', name: 'Claude Opus 5.5', hint: 'Most capable' },
  { id: 'claude-sonnet-5-5', name: 'Claude Sonnet 5.5', hint: 'Balanced' },
  { id: 'claude-haiku-5-5', name: 'Claude Haiku 5.5', hint: 'Fastest' },
];

const efforts: ModelEffort[] = ['low', 'medium', 'high'];

const context = {
  limit: 200_000,
  breakdown: [
    { label: 'System prompt', value: 2400 },
    { label: 'Tool definitions', value: 6100 },
    { label: 'Connected data sources', value: 9800 },
    { label: 'Conversation', value: 24_260 },
  ],
};

export default function PromptComposerDemo() {
  const [status, setStatus] = useState<PromptComposerStatus>('idle');
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  return (
    <div className="w-full max-w-xl">
      <PromptComposer
        placeholder="Ask about your Acme Inc. workspace…"
        models={models}
        defaultModel="claude-sonnet-5-5"
        efforts={efforts}
        context={context}
        status={status}
        onSubmit={() => {
          setStatus('submitting');
          timer.current = setTimeout(() => {
            setStatus('streaming');
            timer.current = setTimeout(() => setStatus('idle'), 3000);
          }, 600);
        }}
        onStop={() => {
          clearTimeout(timer.current);
          setStatus('idle');
        }}
      />
    </div>
  );
}
