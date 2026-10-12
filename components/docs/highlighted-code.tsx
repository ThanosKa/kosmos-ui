import type { ComponentProps } from 'react';
import { highlight } from 'fumadocs-core/highlight';
import { cn } from '@/lib/cn';
import { CodeBlock, Pre } from './code-block';

type HighlightedCodeProps = Omit<ComponentProps<typeof CodeBlock>, 'children'> & { code: string; lang: string };

/** `code` highlighted on the server with the docs' Shiki themes, in a Kosmos code block. */
export async function HighlightedCode({ code, lang, className, ...codeblock }: HighlightedCodeProps) {
  return await highlight(code, {
    lang,
    defaultColor: false,
    components: {
      pre: ({ className: shikiClassName, style, children }) => (
        <CodeBlock {...codeblock} className={cn(shikiClassName, className)} style={style}>
          <Pre>{children}</Pre>
        </CodeBlock>
      ),
    },
  });
}
