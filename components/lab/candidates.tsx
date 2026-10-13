import type { ComponentType } from 'react';

export type Candidate = {
  slug: string;
  title: string;
  kind: 'component' | 'block';
  /** Why it earns a place in Kosmos, in one or two sentences. */
  why: string;
  Preview: ComponentType;
};

/** Every candidate on `/lab`, in review order. Each lives in `components/lab/<slug>/`. */
export const candidates: Candidate[] = [];
