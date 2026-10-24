'use client';

import { usePackageManager } from '@/components/docs/use-package-manager';
import { CodeTabs } from '@/registry/kosmos/ui/code-tabs';

const done = <span className="text-success">✔</span>;

/**
 * What `shadcn add` prints for a block, with one tab per package manager: the command, its steps and every file it
 * writes. The package manager is the one the visitor picked anywhere on the site.
 */
export function InstallTerminal<T extends string>({ commands, files }: { commands: Record<T, string>; files: string[] }) {
  const [manager, setManager] = usePackageManager(Object.keys(commands) as T[]);
  return (
    <CodeTabs commands={commands} value={manager} onValueChange={setManager}>
      <pre className="px-3 pt-1 font-mono whitespace-pre-wrap wrap-break-word">
        {done} Checking registry.{'\n'}
        {done} Installing dependencies.{'\n'}
        {done} Created {files.length} files:
        {/* A path too long for the line wraps under itself, not under the dash, so it never reads as two files. */}
        {files.map((file) => (
          <span key={file} className="block ps-[4ch] -indent-[2ch]">
            {'- '}
            <span data-terminal-file>{file}</span>
          </span>
        ))}
        {done} Updating app/globals.css
      </pre>
    </CodeTabs>
  );
}
