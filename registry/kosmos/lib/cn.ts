import { createCn } from 'cn/config';

/**
 * `cn` (clsx + Tailwind conflict resolution) that knows the Kosmos type roles are font
 * sizes. The default merger reads `text-body` as a text color and drops the
 * `text-primary-foreground` before it. Keep the list in sync with the type roles in tokens.css.
 */
export const cn = createCn({
  extend: {
    classGroups: {
      'font-size': [{ text: ['caption', 'small', 'body', 'title', 'heading', 'display'] }],
    },
  },
});
