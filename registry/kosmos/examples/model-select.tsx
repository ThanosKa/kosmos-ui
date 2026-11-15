'use client';

import { OverlayStage, OverlayStageGrid } from '@/components/preview/overlay-stage';
import { PreviewSection, PreviewStack } from '@/components/preview/preview-section';
import { StateMatrix, defaultStates, previewState } from '@/components/preview/state-matrix';
import { ModelSelect, ModelSelectButton, type ModelEffort, type ModelOption } from '@/registry/kosmos/ui/model-select';

const models: ModelOption[] = [
  { id: 'claude-opus-5-5', name: 'Claude Opus 5.5', hint: 'Most capable' },
  { id: 'claude-sonnet-5-5', name: 'Claude Sonnet 5.5', hint: 'Balanced' },
  { id: 'claude-haiku-5-5', name: 'Claude Haiku 5.5', hint: 'Fastest' },
];

const mixedModels: ModelOption[] = [
  models[0],
  models[1],
  { id: 'claude-haiku-5-5', name: 'Claude Haiku 5.5', hint: 'One speed', efforts: [] },
  { id: 'claude-opus-5-5-1m', name: 'Claude Opus 5.5 (1M context)', hint: 'Not on your plan', disabled: true },
];

const longModels: ModelOption[] = [
  { id: 'long', name: 'Claude Sonnet 5.5 for the weekly summary and quota reports', hint: 'Tuned for Acme' },
  ...models,
];

const efforts: ModelEffort[] = ['low', 'medium', 'high'];

const states = [...defaultStates.slice(0, 4), 'open', 'disabled'] as const;
const rows = ['with effort', 'model only', 'none chosen', 'long name'] as const;

const stageClass = 'h-[20rem]';

export default function ModelSelectPreview() {
  return (
    <PreviewStack>
      <PreviewSection title="Trigger">
        <StateMatrix
          rows={rows}
          states={states}
          render={(row, state) => (
            <div className={row === 'long name' ? 'w-full max-w-40' : 'w-full'}>
              <ModelSelectButton
                model={row === 'none chosen' ? undefined : row === 'long name' ? longModels[0] : models[1]}
                effort={row === 'with effort' || row === 'long name' ? 'medium' : undefined}
                {...(state === 'open' ? { 'data-popup-open': '' } : previewState(state))}
              />
            </div>
          )}
        />
      </PreviewSection>

      <PreviewSection title="Open">
        <OverlayStageGrid>
          <OverlayStage label="models and effort" className={stageClass}>
            {(container) => (
              <ModelSelect
                models={models}
                defaultValue="claude-sonnet-5-5"
                efforts={efforts}
                defaultEffort="medium"
                open
                modal={false}
                container={container}
              />
            )}
          </OverlayStage>

          <OverlayStage label="a model with one speed chosen, a disabled model" className={stageClass}>
            {(container) => (
              <ModelSelect
                models={mixedModels}
                defaultValue="claude-haiku-5-5"
                efforts={efforts}
                open
                modal={false}
                container={container}
              />
            )}
          </OverlayStage>

          <OverlayStage label="model only, no efforts" className={stageClass}>
            {(container) => (
              <ModelSelect models={models} defaultValue="claude-opus-5-5" open modal={false} container={container} />
            )}
          </OverlayStage>

          <OverlayStage label="long name in a narrow slot, no room below (flips up)" className={stageClass}>
            {(container) => (
              <div className="flex h-full max-w-48 items-end">
                <ModelSelect
                  models={longModels}
                  defaultValue="long"
                  efforts={efforts}
                  defaultEffort="high"
                  open
                  modal={false}
                  container={container}
                />
              </div>
            )}
          </OverlayStage>
        </OverlayStageGrid>
      </PreviewSection>

      <PreviewSection title="Live">
        <div className="flex flex-wrap items-center gap-3">
          <ModelSelect models={mixedModels} defaultValue="claude-sonnet-5-5" efforts={efforts} />
          <ModelSelect models={models} defaultValue="claude-opus-5-5" />
          <ModelSelect models={models} efforts={efforts} disabled />
        </div>
      </PreviewSection>
    </PreviewStack>
  );
}
