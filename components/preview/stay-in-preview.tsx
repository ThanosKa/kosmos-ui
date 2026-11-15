'use client';

import { useEffect } from 'react';

/**
 * Keeps a preview in place: a link in an example points at a page of the sample app (`/pricing`, `/sign-up`), which
 * this site does not have, so a click on a same-origin link the example left alone goes nowhere. Outside links still
 * open. Listens on `window` so the example's own handlers (view switches, client routing) run first.
 */
export function StayInPreview() {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || !(event.target instanceof Element)) return;
      const link = event.target.closest('a[href]');
      if (link instanceof HTMLAnchorElement && link.origin === window.location.origin) event.preventDefault();
    };
    window.addEventListener('click', onClick);
    return () => window.removeEventListener('click', onClick);
  }, []);
  return null;
}
