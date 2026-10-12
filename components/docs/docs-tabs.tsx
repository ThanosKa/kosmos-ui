'use client';

import type { ReactNode } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/registry/kosmos/ui/tabs';
import { usePackageManager } from './use-package-manager';

export type DocsTab = { label: string; content: ReactNode };

/** A Kosmos tab row over open panels, such as the CLI and Manual install paths. The first tab starts selected. */
export function DocsTabs({ tabs }: { tabs: DocsTab[] }) {
  return (
    <Tabs defaultValue={tabs[0].label} className="not-prose my-6 min-w-0">
      <TabsList>
        {tabs.map((tab) => (
          <TabsTrigger key={tab.label} value={tab.label}>
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {tabs.map((tab) => (
        <TabsContent key={tab.label} value={tab.label} keepMounted>
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  );
}

/**
 * One code panel per package manager on a code card, with the tabs in the card's header. The choice is shared
 * with every other install tab and the install chip, and remembered on later visits.
 */
export function PackageManagerTabs<T extends string>({ managers, panels }: { managers: readonly T[]; panels: Record<T, ReactNode> }) {
  const [manager, setManager] = usePackageManager(managers);
  return (
    <Tabs
      value={manager}
      onValueChange={(value) => setManager(value as T)}
      className="not-prose min-w-0 gap-0 rounded-2xl border border-transparent bg-card shadow-card"
    >
      <TabsList aria-label="Package manager" className="px-2">
        {managers.map((item) => (
          <TabsTrigger key={item} value={item}>
            {item}
          </TabsTrigger>
        ))}
      </TabsList>
      {managers.map((item) => (
        <TabsContent key={item} value={item} keepMounted className="focus-visible:-outline-offset-2">
          {panels[item]}
        </TabsContent>
      ))}
    </Tabs>
  );
}
