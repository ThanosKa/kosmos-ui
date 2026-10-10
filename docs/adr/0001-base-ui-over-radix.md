# Base UI instead of Radix for primitives

Every component is built on Base UI primitives; Radix is not used anywhere. Base UI has been the shadcn default since July 2026, so our registry items match the projects people install them into, and since we started from zero there was no migration cost. The visual style (shadows, easings, typography) is plain CSS and motion, so it does not depend on the primitive library.

## Consequences

- A component that has no Base UI primitive is built from plain elements, not pulled in from Radix.
- Registry items declare Base UI as their dependency; mixing in Radix would give users two primitive libraries.
