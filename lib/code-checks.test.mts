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
  {
    name: 'sticky chrome has an opaque fill',
    file: 'registry/kosmos/blocks/example/example.tsx',
    flagged: `
export function Bar() {
  return <header className="sticky top-0 z-40 bg-background/80 border-b">Fernhill Books</header>;
}
`,
    message: 'Sticky chrome sits on an opaque fill (`bg-background`), not a translucent `bg-*/NN` (kosmos-style, Surfaces).',
    allowed: `
export function Bar() {
  return <header className="sticky top-0 z-40 border-b bg-background">Fernhill Books</header>;
}
`,
  },
  {
    name: 'an icon-only button has an accessible name',
    file: 'registry/kosmos/blocks/example/example.tsx',
    flagged: `
import { X } from 'lucide-react';
import { Button } from '@/registry/kosmos/ui/button';

export function Close() {
  return (
    <Button variant="ghost" size="icon">
      <X />
    </Button>
  );
}
`,
    message: 'An icon-only `Button` needs `aria-label` (or a `sr-only` label) naming its action (kosmos-style, Buttons).',
    allowed: `
import { X } from 'lucide-react';
import { Button } from '@/registry/kosmos/ui/button';

export function Close() {
  return (
    <Button variant="ghost" size="icon" aria-label="Close">
      <X />
    </Button>
  );
}
`,
  },
  {
    name: 'a component sizes in spacing units',
    file: 'registry/kosmos/ui/example.tsx',
    flagged: `
export function Row() {
  return <div className="h-[30px] px-2.5">Fernhill Books</div>;
}
`,
    message: 'Size in spacing units (`h-7.5`, `py-1.25`), not arbitrary pixels, so the density setting reaches it (kosmos-style, Presets with a style).',
    allowed: `
export function Row() {
  return <div className="h-7.5 px-2.5 tracking-[0.05em]">Fernhill Books</div>;
}
`,
  },
  {
    name: 'demo data holds no key-like string',
    file: 'registry/kosmos/blocks/example/example.tsx',
    flagged: `
export const secretKey = 'sk_live_51HxQ2eLkd93Jf8aZpR7vNc';
`,
    message: 'Demo keys start with `acme_` and never contain `sk_`, `pk_` or `whsec_`, which push protection reads as real keys (kosmos-style, Demo world).',
    allowed: `
export const secretKey = 'acme_secret_demo_7Q2Kf9r3Vx';
`,
  },
  {
    name: 'a logo takes its brand color on the mark only',
    file: 'registry/kosmos/blocks/example/example.tsx',
    flagged: `
export function Brand() {
  return <li className="text-muted-foreground hover:text-(--logo-color,var(--foreground))">Fernhill Books</li>;
}
`,
    message:
      'A logo takes `--logo-color` on its mark only (`[&_:is(svg,img)]:text-(--logo-color)`); the name stays `text-foreground`, since a brand color can fall below 4.5:1 (kosmos-style, Contrast).',
    allowed: `
export function Brand() {
  return <li className="text-muted-foreground hover:text-foreground hover:[&_:is(svg,img)]:text-(--logo-color,var(--foreground))">Fernhill Books</li>;
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
