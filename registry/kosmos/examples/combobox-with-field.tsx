'use client';

import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList } from '@/registry/kosmos/ui/combobox';
import { Field, FieldDescription, FieldError, FieldLabel } from '@/registry/kosmos/ui/field';

const team = ['Lena Park', 'Tomás Ortega', 'Ama Mensah', 'Kai Nakamura'];

function AssigneeCombobox() {
  return (
    <Combobox items={team} name="assignee">
      <ComboboxInput placeholder="Search the team" />
      <ComboboxContent>
        <ComboboxEmpty>No one on the team matches.</ComboboxEmpty>
        <ComboboxList>
          {(person: string) => (
            <ComboboxItem key={person} value={person}>
              {person}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}

export default function ComboboxWithField() {
  return (
    <div className="grid w-full max-w-xl gap-6 sm:grid-cols-2">
      <Field>
        <FieldLabel>Assignee</FieldLabel>
        <AssigneeCombobox />
        <FieldDescription>They get an email when the item moves.</FieldDescription>
      </Field>
      <Field invalid>
        <FieldLabel>Assignee</FieldLabel>
        <AssigneeCombobox />
        <FieldError>Pick who works on this item.</FieldError>
      </Field>
    </div>
  );
}
