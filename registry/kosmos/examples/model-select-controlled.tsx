'use client';

import { useState } from 'react';
import { ModelSelect, modelEffortLabels, type ModelEffort, type ModelOption } from '@/registry/kosmos/ui/model-select';

const models: ModelOption[] = [
  { id: 'claude-opus-5-5', name: 'Claude Opus 5.5', hint: 'Most capable' },
  { id: 'claude-sonnet-5-5', name: 'Claude Sonnet 5.5', hint: 'Balanced' },
  { id: 'claude-haiku-5-5', name: 'Claude Haiku 5.5', hint: 'Fastest' },
];

const efforts: ModelEffort[] = ['low', 'medium', 'high'];

export default function ModelSelectControlled() {
  const [modelId, setModelId] = useState('claude-opus-5-5');
  const [effort, setEffort] = useState<ModelEffort>('high');
  const model = models.find((option) => option.id === modelId);

  return (
    <div className="flex flex-col items-start gap-2">
      <ModelSelect
        models={models}
        value={modelId}
        onValueChange={setModelId}
        efforts={efforts}
        effort={effort}
        onEffortChange={setEffort}
      />
      <p className="px-2 text-small text-muted-foreground" aria-live="polite">
        The next run uses {model?.name} at {modelEffortLabels[effort].toLowerCase()} effort.
      </p>
    </div>
  );
}
