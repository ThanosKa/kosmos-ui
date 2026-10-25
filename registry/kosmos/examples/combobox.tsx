'use client';

import { Fragment, type ComponentProps } from 'react';
import { OverlayStage } from '@/components/preview/overlay-stage';
import { PreviewSection, PreviewStack } from '@/components/preview/preview-section';
import { StateMatrix, previewState } from '@/components/preview/state-matrix';
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxCollection,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxGroupLabel,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxSeparator,
  ComboboxValue,
} from '@/registry/kosmos/ui/combobox';

type Project = { value: string; label: string; disabled?: boolean };

const projects: Project[] = [
  { value: 'fernhill', label: 'Fernhill Books' },
  { value: 'brightloop', label: 'Brightloop Fitness' },
  { value: 'copperline', label: 'Copperline Bank' },
  { value: 'saltmarsh', label: 'Saltmarsh Coffee' },
  { value: 'driftwood', label: 'Driftwood Travel' },
  { value: 'hollowoak', label: 'Hollow Oak Games', disabled: true },
  { value: 'cirrus', label: 'Cirrus Weather' },
  { value: 'pebblepine', label: 'Pebble & Pine' },
  { value: 'marigold', label: 'Marigold Recipes' },
  { value: 'kiln', label: 'Kiln Studio' },
  { value: 'tidepool', label: 'Tidepool Notes' },
  { value: 'ironbark', label: 'Ironbark Logistics' },
];

const byPlan = [
  { value: 'Scale', items: [projects[0], projects[1], projects[2], projects[11]] },
  { value: 'Pro', items: [projects[3], projects[4], projects[6], projects[8], projects[10]] },
  { value: 'Free', items: [projects[7], projects[9]] },
];

const events = ['page_viewed', 'button_clicked', 'screen_viewed', 'signed_up', 'checkout_completed', 'invite_sent'];

const rows = ['placeholder', 'value', 'chips'] as const;
const states = ['default', 'focus', 'invalid', 'invalid focus', 'disabled'] as const;

function stateProps(state: (typeof states)[number]) {
  if (state === 'invalid') return { 'aria-invalid': true } as const;
  if (state === 'invalid focus') return { 'aria-invalid': true, 'data-preview': 'focus' } as const;
  if (state === 'disabled') return {};
  return previewState(state);
}

function ProjectItem({ project }: { project: Project }) {
  return (
    <ComboboxItem value={project} disabled={project.disabled}>
      {project.label}
    </ComboboxItem>
  );
}

function ProjectList() {
  return (
    <ComboboxContent>
      <ComboboxEmpty>No projects match.</ComboboxEmpty>
      <ComboboxList>{(project: Project) => <ProjectItem key={project.value} project={project} />}</ComboboxList>
    </ComboboxContent>
  );
}

function EventChips({ label, ...inputProps }: { label: string } & ComponentProps<typeof ComboboxChipsInput>) {
  return (
    <ComboboxValue>
      {(selected: string[]) => (
        <>
          {selected.map((event) => (
            <ComboboxChip key={event} className="font-mono">
              {event}
            </ComboboxChip>
          ))}
          <ComboboxChipsInput aria-label={label} placeholder={selected.length > 0 ? undefined : 'Add events'} {...inputProps} />
        </>
      )}
    </ComboboxValue>
  );
}

export default function ComboboxPreview() {
  return (
    <PreviewStack>
      <PreviewSection title="Open">
        <div className="grid gap-4 md:grid-cols-3">
          <OverlayStage label="filtered, selected" className="h-72">
            {(container) => (
              <Combobox items={projects} open defaultInputValue="co" defaultValue={projects[2]}>
                <ComboboxInput aria-label="Project, filtered" placeholder="Search projects" />
                <ComboboxContent container={container}>
                  <ComboboxEmpty>No projects match.</ComboboxEmpty>
                  <ComboboxList>{(project: Project) => <ProjectItem key={project.value} project={project} />}</ComboboxList>
                </ComboboxContent>
              </Combobox>
            )}
          </OverlayStage>
          <OverlayStage label="groups, selected, disabled" className="h-72">
            {(container) => (
              <Combobox items={byPlan} open defaultValue={projects[6]}>
                <ComboboxInput aria-label="Project, grouped" placeholder="Search projects" showClear />
                <ComboboxContent container={container}>
                  <ComboboxList>
                    {(group: (typeof byPlan)[number], index: number) => (
                      <Fragment key={group.value}>
                        {index > 0 ? <ComboboxSeparator /> : null}
                        <ComboboxGroup items={group.items}>
                          <ComboboxGroupLabel>{group.value}</ComboboxGroupLabel>
                          <ComboboxCollection>{(project: Project) => <ProjectItem key={project.value} project={project} />}</ComboboxCollection>
                        </ComboboxGroup>
                      </Fragment>
                    )}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
            )}
          </OverlayStage>
          <OverlayStage label="multiple, chips" className="h-72">
            {(container) => (
              <Combobox items={events} multiple open defaultValue={['signed_up', 'checkout_completed']}>
                <ComboboxChips>
                  <EventChips label="Events, open" />
                </ComboboxChips>
                <ComboboxContent container={container}>
                  <ComboboxEmpty>No events match.</ComboboxEmpty>
                  <ComboboxList>
                    {(event: string) => (
                      <ComboboxItem key={event} value={event} className="font-mono">
                        {event}
                      </ComboboxItem>
                    )}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
            )}
          </OverlayStage>
          <OverlayStage label="no match" className="h-44">
            {(container) => (
              <Combobox items={projects} open defaultInputValue="Juniper">
                <ComboboxInput aria-label="Project, no match" placeholder="Search projects" />
                <ComboboxContent container={container}>
                  <ComboboxEmpty>No projects match “Juniper”.</ComboboxEmpty>
                  <ComboboxList>{(project: Project) => <ProjectItem key={project.value} project={project} />}</ComboboxList>
                </ComboboxContent>
              </Combobox>
            )}
          </OverlayStage>
        </div>
      </PreviewSection>

      <PreviewSection title="Field × states">
        <StateMatrix
          rows={rows}
          states={states}
          render={(row, state) =>
            row === 'chips' ? (
              <Combobox items={events} multiple defaultValue={['signed_up']} disabled={state === 'disabled'}>
                <ComboboxChips>
                  <EventChips label={`Events, ${state}`} {...stateProps(state)} />
                </ComboboxChips>
              </Combobox>
            ) : (
              <Combobox items={projects} defaultValue={row === 'value' ? projects[6] : null} disabled={state === 'disabled'}>
                <ComboboxInput aria-label={`Project, ${row}, ${state}`} placeholder="Search projects" showClear {...stateProps(state)} />
                <ProjectList />
              </Combobox>
            )
          }
        />
      </PreviewSection>

      <PreviewSection title="Long values and many chips">
        <div className="flex flex-col gap-4">
          <Combobox items={projects} defaultValue={{ value: 'long', label: 'Quarterly event export for every live project on the Scale plan' }}>
            <ComboboxInput aria-label="Report" className="w-56" showClear />
          </Combobox>
          <Combobox items={events} multiple defaultValue={[...events, 'checkout_completed_after_trial_ended_on_annual_plan']}>
            <ComboboxChips className="max-w-sm">
              <EventChips label="Events, many" />
            </ComboboxChips>
          </Combobox>
        </div>
      </PreviewSection>
    </PreviewStack>
  );
}
