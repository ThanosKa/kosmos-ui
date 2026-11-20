import type { KnownException } from '../lib/site-check.ts';

/** Findings the browser check lets pass. Each entry names its reason; a finding that is not a deliberate choice is fixed, not listed. */
export const knownExceptions: KnownException[] = [];
