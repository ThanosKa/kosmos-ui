'use client';

import { Check, Copy } from 'lucide-react';
import { useCopyButton } from 'fumadocs-ui/utils/use-copy-button';
import { Button } from '@/registry/kosmos/ui/button';
import { usePackageManager } from './use-package-manager';

/**
 * One-click copy of a component's `shadcn add` command, in the package manager the visitor last picked in
 * an install tab. `commands` maps each manager to its command; the first is the default.
 */
export function InstallChip({ commands }: { commands: Record<string, string> }) {
  const managers = Object.keys(commands);
  const [manager] = usePackageManager(managers);
  const command = commands[manager];
  const [copied, onCopy] = useCopyButton(() => navigator.clipboard.writeText(command));

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
