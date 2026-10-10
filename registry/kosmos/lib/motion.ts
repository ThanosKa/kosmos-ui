export const ease = {
  power3Out: [0.25, 1, 0.5, 1],
  smoothInOut: [0.7, 0, 0, 1],
} as const;

export const duration = {
  instant: 0.1,
  fast: 0.15,
  base: 0.2,
  overlay: 0.25,
  slow: 0.3,
} as const;

export const spring = { type: 'spring', duration: 0.3, bounce: 0 } as const;
