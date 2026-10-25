'use client';

import * as React from 'react';

/** How long a copy shows as done, such as a check mark on its button. */
const copiedFor = 2000;

type CopyResult = 'idle' | 'copied' | 'failed';

type Clipboard = { writeText: (text: string) => Promise<void> };

/**
 * Puts `text` on the clipboard and says whether it got there. A page served over plain http has no
 * `navigator.clipboard` (`null` here), and a browser may refuse; both count as failed.
 */
async function copyText(text: string, clipboard: Clipboard | null = globalThis.navigator?.clipboard ?? null): Promise<'copied' | 'failed'> {
  if (!clipboard) return 'failed';
  try {
    await clipboard.writeText(text);
    return 'copied';
  } catch {
    return 'failed';
  }
}

/**
 * Copies `text` on `copy()` and keeps the result for that text only, so a new text starts idle. `copied` turns back
 * to idle after two seconds; `failed` stays until the next copy. `onFailure` runs on a failed copy, the place to
 * select the text so it can be copied by hand.
 */
function useCopy(text: string, { onFailure }: { onFailure?: () => void } = {}) {
  const [last, setLast] = React.useState<{ text: string; result: CopyResult } | null>(null);
  const timer = React.useRef<ReturnType<typeof setTimeout>>(undefined);
  React.useEffect(() => () => clearTimeout(timer.current), []);
  const copy = () => {
    clearTimeout(timer.current);
    setLast(null);
    void copyText(text).then((result) => {
      if (result === 'failed') onFailure?.();
      setLast({ text, result });
      if (result === 'copied') timer.current = setTimeout(() => setLast(null), copiedFor);
    });
  };
  return [last?.text === text ? last.result : 'idle', copy] as const;
}

export { copyText, useCopy, type CopyResult };
