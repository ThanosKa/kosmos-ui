import Link from 'next/link';
import { Fragment, type ReactNode } from 'react';

const inlinePattern = /`([^`]+)`|\[([^\]]+)\]\(([^)\s]+)\)|\*\*([^*]+)\*\*/g;

/**
 * The inline Markdown that API descriptions are written in (`code`, [links](/docs) and **bold**), as React
 * nodes. Style the result with `inlineProseClass` on a parent outside `prose`.
 */
export function InlineMarkdown({ text }: { text: string }) {
  const nodes: ReactNode[] = [];
  let index = 0;
  for (const match of text.matchAll(inlinePattern)) {
    if (match.index > index) nodes.push(text.slice(index, match.index));
    const [, code, label, href, strong] = match;
    if (code !== undefined) nodes.push(<code key={match.index}>{code}</code>);
    else if (href !== undefined)
      nodes.push(
        href.startsWith('/') || href.startsWith('#') ? (
          <Link key={match.index} href={href}>
            {label}
          </Link>
        ) : (
          <a key={match.index} href={href}>
            {label}
          </a>
        ),
      );
    else nodes.push(<strong key={match.index}>{strong}</strong>);
    index = match.index + match[0].length;
  }
  if (index < text.length) nodes.push(text.slice(index));
  return <Fragment>{nodes}</Fragment>;
}
