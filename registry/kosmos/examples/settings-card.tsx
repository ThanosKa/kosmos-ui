'use client';

import { SettingsCard, useSettingsForm } from '@/registry/kosmos/blocks/settings/settings';
import { Field, FieldDescription, FieldLabel } from '@/registry/kosmos/ui/field';
import { Input } from '@/registry/kosmos/ui/input';

export default function SettingsCardExample() {
  const form = useSettingsForm({ workspace: 'Acme', domain: 'acme.example' }, async (values) => {
    await new Promise((resolve) => setTimeout(resolve, 700));
    if (values.workspace.trim() === '') throw new Error('Give the workspace a name.');
  });

  return (
    <SettingsCard
      className="max-w-lg"
      title="Workspace"
      description="The name people see when they join."
      dirty={form.dirty}
      state={form.state}
      error={form.error}
      onSave={form.save}
      onReset={form.reset}
    >
      <Field>
        <FieldLabel>Name</FieldLabel>
        <Input value={form.values.workspace} onValueChange={(value) => form.setValue('workspace', value)} />
      </Field>
      <Field>
        <FieldLabel>Domain</FieldLabel>
        <Input value={form.values.domain} onValueChange={(value) => form.setValue('domain', value)} />
        <FieldDescription>Anyone with an address on this domain can ask to join.</FieldDescription>
      </Field>
    </SettingsCard>
  );
}
