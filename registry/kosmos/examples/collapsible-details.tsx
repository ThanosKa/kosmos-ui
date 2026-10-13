'use client';

import * as React from 'react';
import { Collapsible, CollapsibleChevron, CollapsibleContent, CollapsibleTrigger } from '@/registry/kosmos/ui/collapsible';

export default function CollapsibleDetails() {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="flex w-full max-w-md flex-col items-start gap-1">
      <p className="text-body text-foreground">The nightly event rollup failed after 3 retries.</p>
      <Collapsible open={open} onOpenChange={setOpen} className="w-full">
        <CollapsibleTrigger variant="ghost" size="sm" className="-ms-2">
          {open ? 'Hide details' : 'Show details'}
          <CollapsibleChevron size="sm" />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <pre className="mt-1 overflow-x-auto rounded-lg bg-muted p-3 font-mono text-caption text-muted-foreground">
            {'Error: connection reset by peer\n  at sync (jobs/nightly.ts:42)\n  at run (jobs/runner.ts:18)'}
          </pre>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
