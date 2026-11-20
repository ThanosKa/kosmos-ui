'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export type CopyStatus = 'idle' | 'copied' | 'failed';

export const copyFailedMessage = "Couldn't copy. Select the text and copy it.";

const copiedMs = 1500;
const failedMs = 4000;

/**
 * Copies text for a docs button and reports whether it worked. `copy` takes a function so the text, or a fetch for it,
 * starts inside the click: Safari only allows a clipboard write that begins there.
 */
export function useDocsCopy() {
  const [status, setStatus] = useState<CopyStatus>('idle');
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = useCallback((text: () => string | Promise<string>) => {
    const finish = (next: CopyStatus) => {
      clearTimeout(timer.current);
      setStatus(next);
      timer.current = setTimeout(() => setStatus('idle'), next === 'failed' ? failedMs : copiedMs);
    };
    const write = async () => {
      const pending = Promise.resolve(text());
      if (typeof ClipboardItem === 'undefined') return navigator.clipboard.writeText(await pending);
      const blob = pending.then((value) => new Blob([value], { type: 'text/plain' }));
      return navigator.clipboard.write([new ClipboardItem({ 'text/plain': blob })]);
    };
    write().then(
      () => finish('copied'),
      () => finish('failed'),
    );
  }, []);

  return { status, copied: status === 'copied', copy };
}

/** What a screen reader hears after a copy: `done` when it worked, the failure message when it did not. */
export function copyAnnouncement(status: CopyStatus, done: string) {
  return status === 'copied' ? done : status === 'failed' ? copyFailedMessage : '';
}
