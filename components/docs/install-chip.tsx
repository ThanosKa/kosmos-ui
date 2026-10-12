'use client';

import { useSyncExternalStore } from 'react';
import { Check, Copy } from 'lucide-react';
import { useCopyButton } from 'fumadocs-ui/utils/use-copy-button';
import { Button } from '@/registry/kosmos/ui/button';

/** The storage key and values the package manager tabs (`PackageManagerTabs`) remember the visitor's choice under. */
const managerKey = 'package-manager';

function readManager(managers: string[]) {
  const saved = sessionStorage.getItem(managerKey) ?? localStorage.getItem(managerKey);
  return saved && managers.includes(saved) ? saved : managers[0];
}

function subscribeToManager(onChange: () => void) {
  // Fumadocs keeps its tab-group listeners private, so a tab picked on this page is noticed after the click or key press that picked it.
  const events = ['click', 'keyup'] as const;
  for (const type of events) document.addEventListener(type, onChange);
  window.addEventListener('storage', onChange);
  return () => {
    for (const type of events) document.removeEventListener(type, onChange);
    window.removeEventListener('storage', onChange);
  };
}

/**
 * One-click copy of a component's `shadcn add` command, in the package manager the visitor last picked in
 * an install tab. `commands` maps each manager to its command; the first is the default.
 */
export function InstallChip({ commands }: { commands: Record<string, string> }) {
  const managers = Object.keys(commands);
  const manager = useSyncExternalStore(subscribeToManager, () => readManager(managers), () => managers[0]);
  const command = commands[manager];
  const [copied, onCopy] = useCopyButton(() => navigator.clipboard.writeText(commands[readManager(managers)]));

  return (
    <>
      <Button
        variant="secondary"
        size="sm"
        onClick={onCopy}
        aria-label={`Copy install command: ${command}`}
        title={command}
        className="max-w-full min-w-0 font-mono text-caption"
      >
        <span className="truncate">{command}</span>
        {copied ? <Check aria-hidden /> : <Copy aria-hidden />}
      </Button>
      <span role="status" className="sr-only">
        {copied ? 'Install command copied' : ''}
      </span>
    </>
  );
}
