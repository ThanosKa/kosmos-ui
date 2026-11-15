import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { ComponentType } from 'react';

/**
 * Preview entries are found by file name: `registry/kosmos/examples/<name>.tsx`
 * (default export) renders at `/view/<name>`. Convention:
 * - `<component>.tsx`: the review preview (state matrix, sizes, ...), the screenshot target.
 * - `<component>-<example>.tsx`: a docs example, embedded with `<ComponentPreview name="..." />`.
 * - `<component>-thumb.tsx`: an overlay pinned open in a `ThumbStage`, shot for the index thumbnail instead of the docs hero.
 * No index file lists them, so adding an example touches no shared file.
 */
export const examplesDir = 'registry/kosmos/examples';

const namePattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export async function loadExample(name: string): Promise<ComponentType | null> {
  if (!namePattern.test(name)) return null;
  try {
    const mod = (await import(`../registry/kosmos/examples/${name}.tsx`)) as { default?: ComponentType };
    return mod.default ?? null;
  } catch {
    return null;
  }
}

export function readExampleSource(name: string): string {
  if (!namePattern.test(name)) throw new Error(`Invalid example name "${name}"`);
  return readFileSync(join(/*turbopackIgnore: true*/ process.cwd(), examplesDir, `${name}.tsx`), 'utf8');
}
