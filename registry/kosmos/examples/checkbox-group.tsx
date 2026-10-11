'use client';

import { CheckboxGroup } from '@base-ui/react/checkbox-group';
import * as React from 'react';
import { Checkbox } from '@/registry/kosmos/ui/checkbox';
import { Field, FieldItem, FieldLabel } from '@/registry/kosmos/ui/field';

const events = [
  { value: 'assigned', label: 'A task is assigned to me' },
  { value: 'mentioned', label: 'Someone mentions me' },
  { value: 'due', label: 'A task I follow is due tomorrow' },
];

export default function CheckboxGroupExample() {
  const id = React.useId();
  const [value, setValue] = React.useState(['assigned', 'mentioned']);

  return (
    <Field name="notify">
      <CheckboxGroup
        aria-labelledby={id}
        value={value}
        onValueChange={setValue}
        allValues={events.map((event) => event.value)}
        className="flex flex-col gap-3"
      >
        <FieldItem>
          <Checkbox parent />
          <FieldLabel id={id}>Email me when</FieldLabel>
        </FieldItem>
        <div className="flex flex-col gap-3 ps-7">
          {events.map((event) => (
            <FieldItem key={event.value}>
              <Checkbox value={event.value} />
              <FieldLabel>{event.label}</FieldLabel>
            </FieldItem>
          ))}
        </div>
      </CheckboxGroup>
    </Field>
  );
}
