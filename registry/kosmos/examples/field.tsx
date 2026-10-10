import { PreviewSection, PreviewStack } from '@/components/preview/preview-section';
import { Field, FieldContent, FieldDescription, FieldError, FieldLabel } from '@/registry/kosmos/ui/field';
import { Input } from '@/registry/kosmos/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/registry/kosmos/ui/select';
import { Textarea } from '@/registry/kosmos/ui/textarea';

const roles = { viewer: 'Viewer', editor: 'Editor', admin: 'Admin' };

function RoleSelect({ defaultValue }: { defaultValue?: string }) {
  return (
    <Select items={roles} defaultValue={defaultValue ?? null}>
      <SelectTrigger>
        <SelectValue placeholder="Pick a role" />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(roles).map(([value, label]) => (
          <SelectItem key={value} value={value}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export default function FieldPreview() {
  return (
    <PreviewStack>
      <PreviewSection title="States">
        <div className="grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
          <Field>
            <FieldLabel>Email</FieldLabel>
            <Input type="email" placeholder="name@company.com" />
            <FieldDescription>We send the invoice here.</FieldDescription>
          </Field>
          <Field invalid>
            <FieldLabel>Email</FieldLabel>
            <Input type="email" defaultValue="ada@kosmos" />
            <FieldDescription>We send the invoice here.</FieldDescription>
            <FieldError>Enter an email address with a domain, such as name@company.com.</FieldError>
          </Field>
          <Field disabled>
            <FieldLabel>Email</FieldLabel>
            <Input type="email" defaultValue="ada@kosmos.dev" />
            <FieldDescription>Only the owner can change this.</FieldDescription>
          </Field>
          <Field>
            <FieldLabel>Workspace name</FieldLabel>
            <Input defaultValue="Kosmos" />
          </Field>
        </div>
      </PreviewSection>

      <PreviewSection title="With each control">
        <div className="grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
          <Field>
            <FieldLabel>Display name</FieldLabel>
            <Input defaultValue="Ada Lovelace" />
            <FieldDescription>Shown on comments and mentions.</FieldDescription>
          </Field>
          <Field>
            <FieldLabel nativeLabel={false} render={<div />}>
              Role
            </FieldLabel>
            <RoleSelect defaultValue="editor" />
            <FieldDescription>Editors can change projects but not billing.</FieldDescription>
          </Field>
          <Field invalid>
            <FieldLabel nativeLabel={false} render={<div />}>
              Role
            </FieldLabel>
            <RoleSelect />
            <FieldError>Pick a role for this member.</FieldError>
          </Field>
          <Field className="sm:col-span-2 lg:col-span-3">
            <FieldLabel>Bio</FieldLabel>
            <Textarea placeholder="A sentence or two about you" />
            <FieldDescription>Up to 160 characters.</FieldDescription>
          </Field>
        </div>
      </PreviewSection>

      <PreviewSection title="Horizontal: settings rows">
        <div className="flex max-w-xl flex-col divide-y divide-border">
          <Field orientation="horizontal" className="py-4 first:pt-0">
            <FieldContent>
              <FieldLabel nativeLabel={false} render={<div />}>
                Default role
              </FieldLabel>
              <FieldDescription>New members join with this role.</FieldDescription>
            </FieldContent>
            <RoleSelect defaultValue="viewer" />
          </Field>
          <Field orientation="horizontal" className="py-4 last:pb-0">
            <FieldContent>
              <FieldLabel>Session timeout</FieldLabel>
              <FieldDescription>Minutes of inactivity before members sign in again.</FieldDescription>
            </FieldContent>
            <Input type="number" defaultValue={30} className="w-20 tabular-nums" />
          </Field>
        </div>
      </PreviewSection>

      <PreviewSection title="Long text in a narrow field">
        <div className="w-56">
          <Field invalid>
            <FieldLabel>Billing contact for invoices and payment reminders</FieldLabel>
            <Input type="email" defaultValue="ada@kosmos" />
            <FieldDescription>Every invoice, receipt and failed payment notice goes to this address.</FieldDescription>
            <FieldError>Enter an email address with a domain, such as name@company.com.</FieldError>
          </Field>
        </div>
      </PreviewSection>
    </PreviewStack>
  );
}
