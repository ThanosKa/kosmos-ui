'use client';

import { ModelSelect, type ModelEffort, type ModelOption } from '@/registry/kosmos/ui/model-select';

const models: ModelOption[] = [
  { id: 'claude-opus-5-5', name: 'Claude Opus 5.5', hint: 'Most capable' },
  { id: 'claude-sonnet-5-5', name: 'Claude Sonnet 5.5', hint: 'Balanced', efforts: ['low', 'medium'] },
  { id: 'claude-haiku-5-5', name: 'Claude Haiku 5.5', hint: 'One speed', efforts: [] },
  { id: 'claude-opus-5-5-1m', name: 'Claude Opus 5.5 (1M context)', hint: 'Ask an admin', disabled: true },
];

const efforts: ModelEffort[] = ['low', 'medium', 'high'];

export default function ModelSelectEfforts() {
  return <ModelSelect models={models} defaultValue="claude-opus-5-5" efforts={efforts} defaultEffort="high" />;
}
