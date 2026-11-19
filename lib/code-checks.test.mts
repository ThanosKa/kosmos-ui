// Usage: node --test lib/code-checks.test.mts
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { ESLint } from 'eslint';

/**
 * Each code check is a lint rule with two snippets: one it must flag with its message, one it must allow.
 * `file` is where the snippet pretends to live, since each part of the repo takes its own rules.
 */
type CodeCheck = {
  name: string;
  file: string;
  flagged: string;
  message: string;
  allowed: string;
};

const codeChecks: CodeCheck[] = [
  {
    name: 'a scroll area in an overlay scrolls in its body',
    file: 'registry/kosmos/blocks/example/example.tsx',
    flagged: `
import { DrawerContent } from '@/registry/kosmos/ui/drawer';
import { ScrollArea } from '@/registry/kosmos/ui/scroll-area';

export function Panel() {
  return (
    <DrawerContent>
      <ScrollArea className="min-h-0 flex-1">
        <p>Fernhill Books</p>
      </ScrollArea>
    </DrawerContent>
  );
}
`,
    message:
      'A scroll area in an overlay goes in `DialogBody` or `DrawerBody`, which keep its focus ring inside, clear of the overlay\'s edge (kosmos-style, Focus).',
    allowed: `
import { DrawerBody, DrawerContent } from '@/registry/kosmos/ui/drawer';
import { ScrollArea } from '@/registry/kosmos/ui/scroll-area';

export function Panel() {
  return (
    <DrawerContent>
      <DrawerBody>
        <ScrollArea className="max-h-64">
          <p>Fernhill Books</p>
        </ScrollArea>
      </DrawerBody>
    </DrawerContent>
  );
}
`,
  },
];

const eslint = new ESLint({ cwd: process.cwd() });

async function lint(code: string, file: string) {
  const [result] = await eslint.lintText(code, { filePath: file });
  return result.messages.map((message) => message.message);
}

for (const check of codeChecks) {
  test(`${check.name}: flags the snippet that breaks it`, async () => {
    const messages = await lint(check.flagged, check.file);
    assert.ok(messages.includes(check.message), `Got:\n${messages.join('\n')}`);
  });

  test(`${check.name}: allows the snippet that follows it`, async () => {
    assert.deepEqual(await lint(check.allowed, check.file), []);
  });
}
