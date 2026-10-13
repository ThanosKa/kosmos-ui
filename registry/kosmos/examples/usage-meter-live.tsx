'use client';

import { useState } from 'react';
import { Button } from '@/registry/kosmos/ui/button';
import { UsageMeter, type UsageBreakdownRow } from '@/registry/kosmos/ui/usage-meter';

const LIMIT = 200_000;
const fixed: UsageBreakdownRow[] = [
  { label: 'System prompt', value: 2400 },
  { label: 'Tool definitions', value: 6100 },
  { label: 'Skills', value: 3200 },
];

export default function UsageMeterLive() {
  const [conversation, setConversation] = useState(12_000);
  const breakdown = [...fixed, { label: 'Conversation', value: conversation }];

  return (
    <div className="flex items-center gap-2">
      <UsageMeter breakdown={breakdown} limit={LIMIT} />
      <Button variant="secondary" onClick={() => setConversation((value) => Math.min(value + 24_000, LIMIT))}>
        Send a message
      </Button>
      <Button variant="ghost" onClick={() => setConversation(12_000)}>
        Reset
      </Button>
    </div>
  );
}
