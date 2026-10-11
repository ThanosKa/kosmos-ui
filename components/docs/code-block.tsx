'use client';

import { Check, ChevronDown, ChevronUp, Copy } from 'lucide-react';
import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentProps,
  type CSSProperties,
  type ReactNode,
  type RefObject,
} from 'react';
import { cn } from '@/lib/cn';
import { Button } from '@/registry/kosmos/ui/button';

/** How tall a collapsed block is, and what its toggle says. */
const collapseModes = {
  /** A long file, cut at 24rem behind "Show all". */
  file: { height: 'max-h-96', show: 'Show all', hide: 'Show less' },
  /** The first lines of an example under its preview, behind "Show code". */
  peek: { height: 'max-h-36', show: 'Show code', hide: 'Hide code' },
} as const;

type CodeBlockProps = Omit<ComponentProps<'figure'>, 'title'> & {
  /** The file path the code belongs in, such as `components/ui/button.tsx`. */
  title?: ReactNode;
  lineNumbers?: boolean;
  collapse?: keyof typeof collapseModes;
  /** Sits inside another surface (a tab, a preview card), so it draws no card of its own. */
  embedded?: boolean;
};

/**
 * A highlighted code block on the Kosmos card surface. The copy button always copies the whole file,
 * collapsed or not. `children` is the Shiki `<pre>`, whose token colors follow the page's light or dark mode.
 */
export function CodeBlock({
  title,
  lineNumbers,
  collapse = 'file',
  embedded,
  className,
  style,
  children,
  ...props
}: CodeBlockProps) {
  const mode = collapseModes[collapse];
  const viewportRef = useRef<HTMLDivElement>(null);
  const viewportId = useId();
  const [expanded, setExpanded] = useState(false);
  const [overflows, setOverflows] = useState(collapse === 'peek');
  const [fullHeight, setFullHeight] = useState(0);

  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    const content = viewport?.firstElementChild;
    if (!viewport || !content) return;
    const measure = () => {
      if (expanded) return;
      setFullHeight(viewport.scrollHeight);
      setOverflows(viewport.scrollHeight > viewport.clientHeight + 1);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(content);
    return () => observer.disconnect();
  }, [expanded]);

  const collapsed = overflows && !expanded;

  return (
    <figure
      dir="ltr"
      data-slot="code-block"
      data-line-numbers={lineNumbers || undefined}
      {...props}
      style={style}
      className={cn(
        'shiki not-prose relative min-w-0 overflow-hidden text-small',
        embedded ? 'my-0' : 'my-4 rounded-2xl border border-transparent bg-card shadow-card',
        className,
      )}
    >
      {title ? (
        <div className="flex h-10 items-center gap-2 border-b border-border ps-4 pe-2">
          <figcaption className="min-w-0 flex-1 truncate font-mono text-caption text-muted-foreground">{title}</figcaption>
          <CopyButton viewportRef={viewportRef} />
        </div>
      ) : (
        <div className="absolute end-2.5 top-2.5 z-10">
          <CopyButton viewportRef={viewportRef} />
        </div>
      )}
      <div
        ref={viewportRef}
        id={viewportId}
        role="region"
        aria-label={typeof title === 'string' ? title : 'Code'}
        tabIndex={collapsed ? -1 : 0}
        className={cn(
          'overflow-x-auto overflow-y-hidden py-3.5 font-mono focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring',
          'motion-safe:transition-[max-height] motion-safe:duration-slow motion-safe:ease-smooth-in-out',
          !title && '[--padding-right:--spacing(10)]',
          lineNumbers && '[counter-set:line_0]',
          expanded ? 'max-h-(--code-height) pb-12' : mode.height,
        )}
        style={{ '--code-height': `${fullHeight + 48}px` } as CSSProperties}
      >
        {children}
      </div>
      {overflows && (
        <>
          <div
            aria-hidden
            className={cn(
              'pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-linear-to-t from-card from-40% to-transparent transition-[opacity] duration-fast',
              expanded && 'opacity-0',
            )}
          />
          <Button
            variant="secondary"
            size="sm"
            aria-expanded={expanded}
            aria-controls={viewportId}
            onClick={() => setExpanded((value) => !value)}
            className="absolute inset-x-0 bottom-3 mx-auto w-fit"
          >
            {expanded ? mode.hide : mode.show}
            {expanded ? <ChevronUp data-icon="inline-end" /> : <ChevronDown data-icon="inline-end" />}
          </Button>
        </>
      )}
    </figure>
  );
}

function CopyButton({ viewportRef }: { viewportRef: RefObject<HTMLDivElement | null> }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timeout = setTimeout(() => setCopied(false), 1500);
    return () => clearTimeout(timeout);
  }, [copied]);

  const copy = async () => {
    const pre = viewportRef.current?.querySelector('pre');
    if (!pre) return;
    await navigator.clipboard.writeText(pre.textContent ?? '');
    setCopied(true);
  };

  return (
    <>
      <Button variant="secondary" size="icon-sm" aria-label="Copy code" onClick={copy}>
        {copied ? <Check /> : <Copy />}
      </Button>
      <span role="status" className="sr-only">
        {copied ? 'Copied' : ''}
      </span>
    </>
  );
}

/** The `<pre>` Shiki renders: as wide as its longest line, so the viewport scrolls instead of the page. */
export function Pre({ className, ...props }: ComponentProps<'pre'>) {
  return <pre className={cn('w-max min-w-full *:flex *:flex-col', className)} {...props} />;
}
