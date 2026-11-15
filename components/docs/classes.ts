/** The small uppercase label over a section or group of the docs. */
export const eyebrowClass = 'text-caption font-medium tracking-[0.05em] text-muted-foreground uppercase';

/** A card that is one link, with the card surface and the focus outline. */
export const cardLinkClass =
  'group flex flex-col gap-1 rounded-2xl border border-transparent bg-card p-4 shadow-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring';

/** Inline code, links and bold inside a `not-prose` block, matching the prose around it. */
export const inlineProseClass = [
  '[&_code]:rounded-sm [&_code]:border [&_code]:border-border [&_code]:bg-muted [&_code]:px-1 [&_code]:font-mono [&_code]:text-small [&_code]:text-foreground',
  '[&_a]:font-medium [&_a]:text-foreground [&_a]:underline [&_a]:decoration-primary [&_a]:decoration-[1.5px] [&_a]:underline-offset-[3.5px] [&_a]:transition-[opacity] [&_a]:hover:opacity-80',
  '[&_a]:rounded-sm [&_a]:focus-visible:outline-2 [&_a]:focus-visible:outline-offset-2 [&_a]:focus-visible:outline-ring',
  '[&_strong]:font-medium [&_strong]:text-foreground',
].join(' ');

/** The card a table sits in on a docs page. */
export const tableCardClass = 'not-prose my-6 min-w-0 rounded-2xl border border-transparent bg-card shadow-card';
