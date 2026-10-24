'use client';

import * as React from 'react';
import { Switch } from '@/registry/kosmos/ui/switch';
import { StatCard, StatCardDelta, StatCardLabel, StatCardSparkline, StatCardValue } from '@/registry/kosmos/ui/stat-card';

const users = [26800, 27100, 26900, 27600, 27400, 28100, 28300, 28000, 28700, 29100, 28900, 29400].map((value) => ({ value }));

export default function StatCardLoading() {
  const [loading, setLoading] = React.useState(true);

  return (
    <div className="flex w-full max-w-xs flex-col gap-4">
      <label className="flex items-center gap-2 text-body">
        <Switch checked={loading} onCheckedChange={setLoading} />
        Loading
      </label>
      <StatCard loading={loading}>
        <StatCardLabel>Active users</StatCardLabel>
        <StatCardValue>144,600</StatCardValue>
        <StatCardDelta value={9.6}>vs September</StatCardDelta>
        <StatCardSparkline data={users} aria-label="Active users, last 30 days, up 9.6%" />
      </StatCard>
    </div>
  );
}
