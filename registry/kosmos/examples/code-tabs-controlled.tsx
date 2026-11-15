'use client';

import * as React from 'react';
import { CodeTabs } from '@/registry/kosmos/ui/code-tabs';

const install = {
  pnpm: 'pnpm add @acme/analytics',
  npm: 'npm install @acme/analytics',
  yarn: 'yarn add @acme/analytics',
  bun: 'bun add @acme/analytics',
};

const run = {
  pnpm: 'pnpm exec acme login',
  npm: 'npx acme login',
  yarn: 'yarn acme login',
  bun: 'bunx acme login',
};

type PackageManager = keyof typeof install;

export default function CodeTabsControlled() {
  const [manager, setManager] = React.useState<PackageManager>('pnpm');
  return (
    <div className="flex w-full max-w-md flex-col gap-4">
      <CodeTabs commands={install} value={manager} onValueChange={setManager} />
      <CodeTabs commands={run} value={manager} onValueChange={setManager} />
    </div>
  );
}
