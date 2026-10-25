/** The characters a hidden secret keeps at its end, so people can tell two keys apart. */
const shownEnd = 4;

/** Below this length the last four characters would give away a quarter of the secret or more. */
const minLengthToShowEnd = 16;

/** Every hidden secret takes the same dots, so it gives away nothing of its length and its end stays in view. */
const dots = '•'.repeat(12);

/**
 * Hides a secret for display: 12 dots and its last four characters. A secret shorter than 16 characters shows
 * only the dots.
 */
export function maskSecret(secret: string): string {
  if (secret === '') return '';
  return secret.length >= minLengthToShowEnd ? dots + secret.slice(-shownEnd) : dots;
}
