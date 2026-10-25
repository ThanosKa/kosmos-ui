/** The characters a hidden secret keeps at its end, so people can tell two keys apart. */
const shownEnd = 4;

/** The most dots a hidden secret takes, so its last characters stay in view in a field. */
const maxDots = 12;

/**
 * Hides a secret for display: a dot for each character but the last four, at most 12 dots. A secret shorter than
 * 16 characters shows none of itself, since its last four would give away a quarter of it or more.
 */
export function maskSecret(secret: string): string {
  const shown = secret.length >= shownEnd * 4 ? shownEnd : 0;
  return '•'.repeat(Math.min(secret.length - shown, maxDots)) + secret.slice(secret.length - shown);
}
