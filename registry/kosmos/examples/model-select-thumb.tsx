'use client';

import { ThumbStage } from '@/components/preview/overlay-stage';
import { ModelSelect, type ModelEffort, type ModelOption } from '@/registry/kosmos/ui/model-select';

const models: ModelOption[] = [
  { id: 'claude-opus-5-5', name: 'Claude Opus 5.5', hint: 'Most capable' },
  { id: 'claude-sonnet-5-5', name: 'Claude Sonnet 5.5', hint: 'Balanced' },
  { id: 'claude-haiku-5-5', name: 'Claude Haiku 5.5', hint: 'Fastest' },
];

const efforts: ModelEffort[] = ['low', 'medium', 'high'];

/** The components index thumbnail: the docs demo with its menu open. */
export default function ModelSelectThumb() {
  return (
    <ThumbStage className="flex h-60 max-w-md justify-center">
      {(container) => (
        <ModelSelect
          models={models}
          defaultValue="claude-sonnet-5-5"
          efforts={efforts}
          open
          modal={false}
          container={container}
        />
      )}
    </ThumbStage>
  );
}
