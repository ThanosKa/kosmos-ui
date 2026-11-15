'use client';

import { Combobox, ComboboxContent, ComboboxInput, ComboboxItem, ComboboxList } from '@/registry/kosmos/ui/combobox';

type Project = { value: string; label: string };

const projects: Project[] = [
  { value: 'fernhill', label: 'Fernhill Books' },
  { value: 'brightloop', label: 'Brightloop Fitness' },
  { value: 'copperline', label: 'Copperline Bank' },
  { value: 'cirrus', label: 'Cirrus Weather' },
];

/** The components index thumbnail: a combobox with its list open. */
export default function ComboboxThumb() {
  return (
    <div className="flex h-56 w-full max-w-md justify-center">
      <Combobox items={projects} open defaultValue={projects[3]}>
        <ComboboxInput aria-label="Project" placeholder="Search projects" className="w-56" />
        <ComboboxContent>
          <ComboboxList>
            {(project: Project) => (
              <ComboboxItem key={project.value} value={project}>
                {project.label}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </div>
  );
}
