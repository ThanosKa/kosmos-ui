'use client';

import * as React from 'react';
import { DatePicker } from '@/registry/kosmos/ui/date-picker';
import { Field, FieldDescription, FieldLabel } from '@/registry/kosmos/ui/field';

export default function DatePickerDemo() {
  const [date, setDate] = React.useState<Date | null>(null);
  return (
    <Field className="w-64">
      <FieldLabel htmlFor="due-date">Due date</FieldLabel>
      <DatePicker id="due-date" aria-describedby="due-date-hint" name="dueDate" value={date} onValueChange={setDate} />
      <FieldDescription id="due-date-hint">The project closes for new tasks on this day.</FieldDescription>
    </Field>
  );
}
