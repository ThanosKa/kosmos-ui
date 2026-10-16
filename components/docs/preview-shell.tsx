'use client';

import { ArrowUpRight, Lock } from 'lucide-react';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { cn } from '@/registry/kosmos/lib/cn';
import { Button } from '@/registry/kosmos/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/registry/kosmos/ui/tabs';

/** The last height the stage had while it showed, so Code can open at the same height. */
function useStageHeight() {
  const ref = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number>();
  useEffect(() => {
    const stage = ref.current;
    if (!stage) return;
    const measure = () => {
      if (stage.offsetHeight > 0) setHeight(stage.offsetHeight);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);
  return [ref, height] as const;
}

/**
 * The frame every live preview on the docs sits in, a component example or a block: Preview and Code tabs at the
 * top left, the actions at the top right, and a link that opens the preview alone. The stage stays mounted while
 * Code is open, so switching back does not reload it or lose its state. Code opens at the stage's height and
 * scrolls inside, and the toolbar keeps its layout, so switching tabs moves nothing on the page. Controls that only
 * act on the preview (the width buttons) hide with `group-data-[tab=code]/shell:invisible`.
 */
export function PreviewShell({
  title,
  href,
  stage,
  stageClassName,
  code,
  locked,
  actions,
  className,
}: {
  title: string;
  /** The preview alone, opened by the arrow button. */
  href: string;
  stage: ReactNode;
  stageClassName?: string;
  code: ReactNode;
  /** The code is not public (a Pro variant): the Code tab carries a lock. */
  locked?: boolean;
  /** Controls placed left of the open-in-a-new-tab button. */
  actions?: ReactNode;
  className?: string;
}) {
  const [tab, setTab] = useState('preview');
  const [stageRef, stageHeight] = useStageHeight();

  return (
    <Tabs
      value={tab}
      onValueChange={setTab}
      data-tab={tab}
      data-slot="preview-shell"
      className={cn(
        'group/shell @container/viewer min-w-0 gap-0 rounded-2xl border border-transparent bg-card p-px shadow-card [--inner-radius:calc(var(--radius-2xl)-2px)]',
        className,
      )}
    >
      <div className="flex min-w-0 items-center justify-between gap-2 border-b border-border px-2">
        <TabsList aria-label={`${title} view`} className="data-[orientation=horizontal]:border-b-0">
          <TabsTrigger value="preview" className="h-11">
            Preview
          </TabsTrigger>
          <TabsTrigger value="code" className="h-11">
            {locked && <Lock data-icon="inline-start" aria-hidden />}
            Code
          </TabsTrigger>
        </TabsList>
        <div className="flex shrink-0 items-center gap-1.5">
          {actions}
          <Button
            variant="secondary"
            size="icon"
            href={href}
            target="_blank"
            rel="noreferrer"
            aria-label={`Open ${title} in a new tab`}
            title="Open in a new tab"
          >
            <ArrowUpRight aria-hidden />
          </Button>
        </div>
      </div>
      <TabsContent value="preview" keepMounted className="focus-visible:-outline-offset-2">
        <div ref={stageRef} data-preview-stage="" className={cn('overflow-hidden rounded-b-(--inner-radius)', stageClassName)}>
          {stage}
        </div>
      </TabsContent>
      <TabsContent
        value="code"
        style={stageHeight ? { height: stageHeight } : undefined}
        className="flex flex-none flex-col overflow-hidden rounded-b-(--inner-radius) focus-visible:-outline-offset-2"
      >
        {code}
      </TabsContent>
    </Tabs>
  );
}
