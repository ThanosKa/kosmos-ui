'use client';

import { usePathname } from 'next/navigation';

/** The path of the current URL, for pages that never get route params, such as the 404 page. */
export function CurrentPath() {
  return usePathname();
}
