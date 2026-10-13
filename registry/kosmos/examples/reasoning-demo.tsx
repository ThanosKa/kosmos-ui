'use client';

import { RotateCcw } from 'lucide-react';
import * as React from 'react';
import { Button } from '@/registry/kosmos/ui/button';
import { Reasoning } from '@/registry/kosmos/ui/reasoning';

const thought =
  'The Admin asked which projects need attention before the renewal. Acme Inc. has 14 projects. Three are above 90% of their event quota: Checkout, Mobile and Partner API. Checkout grew fastest in Q3, so I will lead with it and suggest raising its quota before November.';

export default function ReasoningDemo() {
  const [run, setRun] = React.useState(0);
  const [length, setLength] = React.useState(0);
  const [durationMs, setDurationMs] = React.useState<number>();

  React.useEffect(() => {
    const started = Date.now();
    let shown = 0;
    const id = window.setInterval(() => {
      shown = Math.min(shown + 4, thought.length);
      setLength(shown);
      if (shown < thought.length) return;
      window.clearInterval(id);
      setDurationMs(Date.now() - started);
    }, 50);
    return () => window.clearInterval(id);
  }, [run]);

  const runAgain = () => {
    setLength(0);
    setDurationMs(undefined);
    setRun((n) => n + 1);
  };

  const thinking = durationMs === undefined;
  return (
    <div className="flex w-full max-w-md flex-col items-start gap-3">
      <Reasoning key={run} status={thinking ? 'thinking' : 'done'} durationMs={durationMs}>
        {thought.slice(0, length)}
      </Reasoning>
      <Button variant="secondary" size="sm" onClick={runAgain}>
        <RotateCcw data-icon="inline-start" />
        Run again
      </Button>
    </div>
  );
}
