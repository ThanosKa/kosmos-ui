'use client';

import * as React from 'react';
import { Collapsible, CollapsibleContent } from '@/registry/kosmos/ui/collapsible';
import { Field, FieldContent, FieldDescription, FieldLabel } from '@/registry/kosmos/ui/field';
import { Input } from '@/registry/kosmos/ui/input';
import { Switch } from '@/registry/kosmos/ui/switch';

export default function CollapsibleControlled() {
  const [customDomain, setCustomDomain] = React.useState(true);
  return (
    <div className="flex w-full max-w-md flex-col">
      <Field name="custom-domain" orientation="horizontal">
        <FieldContent>
          <FieldLabel>Custom domain</FieldLabel>
          <FieldDescription>Serve shared dashboard links from your own domain.</FieldDescription>
        </FieldContent>
        <Switch checked={customDomain} onCheckedChange={setCustomDomain} />
      </Field>
      <Collapsible open={customDomain}>
        <CollapsibleContent className="-mx-1 px-1">
          <Field name="domain" className="pt-4 pb-1">
            <FieldLabel>Domain</FieldLabel>
            <Input defaultValue="dash.acme.example" autoComplete="off" />
          </Field>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
