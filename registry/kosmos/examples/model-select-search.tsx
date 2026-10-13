'use client';

import { Check } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/registry/kosmos/lib/cn';
import { Badge } from '@/registry/kosmos/ui/badge';
import {
  Command,
  CommandCollection,
  CommandEmpty,
  CommandFooter,
  CommandGroup,
  CommandGroupLabel,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/registry/kosmos/ui/command';
import {
  ModelSelectButton,
  ModelSelectEffort,
  type ModelEffort,
  type ModelOption,
} from '@/registry/kosmos/ui/model-select';
import { Popover, PopoverContent, PopoverTrigger } from '@/registry/kosmos/ui/popover';

type SearchModel = ModelOption & { tag?: { label: string; hue: 'magenta' | 'green' | 'blue' } };
type ModelGroup = { value: string; items: SearchModel[] };

const groups: ModelGroup[] = [
  {
    value: 'Recommended',
    items: [
      { id: 'claude-sonnet-5-5', name: 'Claude Sonnet 5.5', tag: { label: 'Balanced', hue: 'green' } },
      { id: 'claude-haiku-5-5', name: 'Claude Haiku 5.5', tag: { label: 'Fast', hue: 'blue' }, efforts: [] },
    ],
  },
  {
    value: 'More models',
    items: [
      { id: 'claude-opus-5-5', name: 'Claude Opus 5.5', tag: { label: 'Most capable', hue: 'magenta' } },
      { id: 'claude-opus-5-5-1m', name: 'Claude Opus 5.5 (1M context)', hint: 'Not on your plan', disabled: true },
    ],
  },
];

const models = groups.flatMap((group) => group.items);
const efforts: ModelEffort[] = ['low', 'medium', 'high'];

export default function ModelSelectSearch() {
  const [open, setOpen] = useState(false);
  const [modelId, setModelId] = useState('claude-sonnet-5-5');
  const [effort, setEffort] = useState<ModelEffort>('medium');
  const selected = models.find((model) => model.id === modelId);
  const available = selected?.efforts ?? efforts;
  const shownEffort = available.includes(effort) ? effort : undefined;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger render={<ModelSelectButton model={selected} effort={shownEffort} />} />
      <PopoverContent align="start" className="w-80 [&_[data-slot=popover-body]]:gap-0 [&_[data-slot=popover-body]]:p-0">
        <Command
          items={groups}
          itemToStringValue={(model: SearchModel) => model.name}
          className="rounded-none border-0 bg-transparent shadow-none"
        >
          <CommandInput placeholder="Search models" aria-label="Search models" />
          <CommandEmpty>No models match.</CommandEmpty>
          <CommandList>
            {(group: ModelGroup) => (
              <CommandGroup key={group.value} items={group.items}>
                <CommandGroupLabel>{group.value}</CommandGroupLabel>
                <CommandCollection>
                  {(model: SearchModel) => (
                    <CommandItem
                      key={model.id}
                      value={model}
                      disabled={model.disabled}
                      onClick={() => {
                        setModelId(model.id);
                        setOpen(false);
                      }}
                    >
                      <span className="min-w-0 break-words">{model.name}</span>
                      {model.id === modelId ? <span className="sr-only">(chosen)</span> : null}
                      {model.tag ? (
                        <Badge variant={model.tag.hue} className="shrink-0">
                          {model.tag.label}
                        </Badge>
                      ) : null}
                      <span className="ms-auto flex shrink-0 items-center gap-2">
                        {model.hint ? <span className="font-normal text-muted-foreground">{model.hint}</span> : null}
                        <Check aria-hidden className={cn('text-foreground', model.id !== modelId && 'invisible')} />
                      </span>
                    </CommandItem>
                  )}
                </CommandCollection>
              </CommandGroup>
            )}
          </CommandList>
          <CommandFooter className="py-1.5 ps-3 pe-1.5">
            <ModelSelectEffort
              efforts={efforts}
              available={available}
              value={shownEffort}
              onValueChange={setEffort}
              className="w-full"
            />
          </CommandFooter>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
