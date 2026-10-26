import type { ComponentProps } from 'react';
import { highlight } from 'fumadocs-core/highlight';
import { cn } from '@/registry/kosmos/lib/cn';
import { CodeBlock, Pre } from './code-block';
import { codeThemes } from './code-themes';

type HighlightedCodeProps = Omit<ComponentProps<typeof CodeBlock>, 'children'> & { code: string; lang: string };

/** `code` highlighted with the Kosmos code themes, in a Kosmos code block. */
export function highlightCode({ code, lang, className, ...codeblock }: HighlightedCodeProps) {
  return highlight(code, {
    lang,
    ...codeThemes,
    components: {
      pre: ({ className: shikiClassName, style, children }) => (
        <CodeBlock {...codeblock} className={cn(shikiClassName, className)} style={style}>
          <Pre>{children}</Pre>
        </CodeBlock>
      ),
    },
  });
}

/** `code` highlighted on the server with the Kosmos code themes, in a Kosmos code block. */
export async function HighlightedCode(props: HighlightedCodeProps) {
  return await highlightCode(props);
}
