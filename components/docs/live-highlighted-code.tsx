'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { highlightCode } from './highlighted-code';

type LiveHighlightedCodeProps = Parameters<typeof highlightCode>[0] & {
  /** What shows until the first highlight is ready, usually the same code in a plain block. */
  fallback: ReactNode;
};

/**
 * `highlightCode` in the browser, for code that is written there (a visitor's choice). Each change keeps the last
 * highlighted block on screen until the next one is ready, so the code never flashes back to plain text.
 */
export function LiveHighlightedCode({ fallback, ...props }: LiveHighlightedCodeProps) {
  const [highlighted, setHighlighted] = useState<ReactNode>(null);
  const { code, lang, title, embedded, className } = props;

  useEffect(() => {
    let stale = false;
    void highlightCode({ code, lang, title, embedded, className }).then((node) => {
      if (!stale) setHighlighted(node);
    });
    return () => {
      stale = true;
    };
  }, [code, lang, title, embedded, className]);

  return highlighted ?? fallback;
}
