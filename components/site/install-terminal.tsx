'use client';

import { Check, Copy } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { usePackageManager } from '@/components/docs/use-package-manager';
import { Button } from '@/registry/kosmos/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/registry/kosmos/ui/tabs';

/** How long the copy button shows its check mark. */
const copiedFor = 2000;

function CopyCommand({ command }: { command: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  const copy = () =>
    navigator.clipboard.writeText(command).then(
      () => {
        setCopied(true);
        clearTimeout(timer.current);
        timer.current = setTimeout(() => setCopied(false), copiedFor);
      },
      () => setCopied(false),
    );
  return (
    <>
      <Button variant="ghost" size="icon" aria-label={`Copy install command: ${command}`} onClick={copy}>
        {copied ? <Check aria-hidden /> : <Copy aria-hidden />}
      </Button>
      <span role="status" className="sr-only">
        {copied ? 'Install command copied' : ''}
      </span>
    </>
  );
}

const done = <span className="text-success">✔</span>;

/**
 * What `shadcn add` prints for a block, with one tab per package manager: the command, its steps and every file it
 * writes. The package manager is the one the visitor picked anywhere on the site.
 */
export function InstallTerminal<T extends string>({ commands, files }: { commands: Record<T, string>; files: string[] }) {
  const managers = Object.keys(commands) as T[];
  const [manager, setManager] = usePackageManager(managers);
  return (
    <Tabs
      value={manager}
      onValueChange={(value) => setManager(value as T)}
      className="min-w-0 gap-0 rounded-2xl border border-transparent bg-card shadow-card"
    >
      <div className="relative">
        <TabsList aria-label="Package manager" className="ps-2 pe-11">
          {managers.map((item) => (
            <TabsTrigger key={item} value={item}>
              {item}
            </TabsTrigger>
          ))}
        </TabsList>
        <div className="absolute end-1.5 top-0.75">
          <CopyCommand command={commands[manager]} />
        </div>
      </div>
      {managers.map((item) => (
        <TabsContent key={item} value={item} className="min-w-0 focus-visible:-outline-offset-2">
          <pre className="px-4 py-3.5 font-mono whitespace-pre-wrap wrap-break-word text-small text-muted-foreground">
            <code>
              <span className="text-foreground">
                <span aria-hidden className="select-none text-muted-foreground">
                  ${' '}
                </span>
                {commands[item]}
              </span>
              {'\n'}
              {done} Checking registry.{'\n'}
              {done} Installing dependencies.{'\n'}
              {done} Created {files.length} files:
              {files.map((file) => (
                <span key={file}>
                  {'\n'}
                  {'  - '}
                  <span data-terminal-file>{file}</span>
                </span>
              ))}
              {'\n'}
              {done} Updating app/globals.css
            </code>
          </pre>
        </TabsContent>
      ))}
    </Tabs>
  );
}
