'use client';

import { Fragment } from 'react';
import {
  Combobox,
  ComboboxCollection,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxGroupLabel,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxSeparator,
} from '@/registry/kosmos/ui/combobox';

type Project = { value: string; label: string };
type PlanGroup = { value: string; items: Project[] };

const projectsByPlan: PlanGroup[] = [
  {
    value: 'Scale',
    items: [
      { value: 'fernhill', label: 'Fernhill Books' },
      { value: 'brightloop', label: 'Brightloop Fitness' },
      { value: 'copperline', label: 'Copperline Bank' },
      { value: 'ironbark', label: 'Ironbark Logistics' },
    ],
  },
  {
    value: 'Pro',
    items: [
      { value: 'saltmarsh', label: 'Saltmarsh Coffee' },
      { value: 'driftwood', label: 'Driftwood Travel' },
      { value: 'hollowoak', label: 'Hollow Oak Games' },
      { value: 'cirrus', label: 'Cirrus Weather' },
      { value: 'marigold', label: 'Marigold Recipes' },
      { value: 'tidepool', label: 'Tidepool Notes' },
    ],
  },
  {
    value: 'Free',
    items: [
      { value: 'pebblepine', label: 'Pebble & Pine' },
      { value: 'kiln', label: 'Kiln Studio' },
    ],
  },
];

export default function ComboboxGroups() {
  return (
    <Combobox items={projectsByPlan}>
      <ComboboxInput aria-label="Project" placeholder="Search projects" className="w-64" />
      <ComboboxContent>
        <ComboboxEmpty>No projects match.</ComboboxEmpty>
        <ComboboxList>
          {(group: PlanGroup, index: number) => (
            <Fragment key={group.value}>
              {index > 0 ? <ComboboxSeparator /> : null}
              <ComboboxGroup items={group.items}>
                <ComboboxGroupLabel>{group.value}</ComboboxGroupLabel>
                <ComboboxCollection>
                  {(project: Project) => (
                    <ComboboxItem key={project.value} value={project}>
                      {project.label}
                    </ComboboxItem>
                  )}
                </ComboboxCollection>
              </ComboboxGroup>
            </Fragment>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
