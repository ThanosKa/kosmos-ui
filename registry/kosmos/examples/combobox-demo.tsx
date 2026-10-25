'use client';

import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList } from '@/registry/kosmos/ui/combobox';

type Project = { value: string; label: string };

const projects: Project[] = [
  { value: 'fernhill', label: 'Fernhill Books' },
  { value: 'brightloop', label: 'Brightloop Fitness' },
  { value: 'copperline', label: 'Copperline Bank' },
  { value: 'saltmarsh', label: 'Saltmarsh Coffee' },
  { value: 'driftwood', label: 'Driftwood Travel' },
  { value: 'hollowoak', label: 'Hollow Oak Games' },
  { value: 'cirrus', label: 'Cirrus Weather' },
  { value: 'pebblepine', label: 'Pebble & Pine' },
  { value: 'marigold', label: 'Marigold Recipes' },
  { value: 'kiln', label: 'Kiln Studio' },
  { value: 'tidepool', label: 'Tidepool Notes' },
  { value: 'ironbark', label: 'Ironbark Logistics' },
];

export default function ComboboxDemo() {
  return (
    <Combobox items={projects} defaultValue={projects[6]}>
      <ComboboxInput aria-label="Project" placeholder="Search projects" showClear className="w-64" />
      <ComboboxContent>
        <ComboboxEmpty>No projects match.</ComboboxEmpty>
        <ComboboxList>
          {(project: Project) => (
            <ComboboxItem key={project.value} value={project}>
              {project.label}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
