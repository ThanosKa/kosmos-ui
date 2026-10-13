'use client';

import * as React from 'react';
import { Reasoning } from '@/registry/kosmos/ui/reasoning';
import { Switch } from '@/registry/kosmos/ui/switch';

export default function ReasoningControlled() {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="flex w-full max-w-md flex-col items-start gap-3">
      <label className="flex items-center gap-3 text-body font-medium text-foreground">
        <Switch checked={open} onCheckedChange={setOpen} />
        Show reasoning
      </label>
      <Reasoning status="done" durationMs={4200} open={open} onOpenChange={setOpen}>
        Acme has 12 projects. Three are close to or over their event quota: Copperline Bank, Cirrus Weather and Ironbark Logistics.
      </Reasoning>
    </div>
  );
}
