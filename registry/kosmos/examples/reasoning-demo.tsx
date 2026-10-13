'use client';

import { RotateCcw } from 'lucide-react';
import * as React from 'react';
import { Button } from '@/registry/kosmos/ui/button';
import { Reasoning } from '@/registry/kosmos/ui/reasoning';

const thought =
  'Lena asked which projects need attention this week. Acme has 12 projects. Three are close to or over their event quota: Copperline Bank (109%), Cirrus Weather (80%) and Ironbark Logistics (79%). Copperline Bank is over its allowance, so I will lead with it and suggest a higher plan before the month ends.';

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
