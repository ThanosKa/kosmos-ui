'use client';

import { usePackageManager } from '@/components/docs/use-package-manager';
import { CodeTabs } from '@/registry/kosmos/ui/code-tabs';

/** Code Tabs with one command per package manager, open on the one the visitor picked anywhere on the site. */
export function InstallTabs<T extends string>({ commands }: { commands: Record<T, string> }) {
  const [manager, setManager] = usePackageManager(Object.keys(commands) as T[]);
  return <CodeTabs commands={commands} value={manager} onValueChange={setManager} />;
}
