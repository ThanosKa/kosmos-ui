'use client';

import { Check, Database, RefreshCw, Server } from 'lucide-react';
import * as React from 'react';
import { cn } from '@/registry/kosmos/lib/cn';

const reducedMotionQuery = '(prefers-reduced-motion: reduce)';

function subscribeReducedMotion(onChange: () => void) {
  const query = window.matchMedia(reducedMotionQuery);
  query.addEventListener('change', onChange);
  return () => query.removeEventListener('change', onChange);
}

function useReducedMotion() {
  return React.useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(reducedMotionQuery).matches,
    () => false,
  );
}

function useInView(ref: React.RefObject<Element | null>) {
  const [inView, setInView] = React.useState(false);
  React.useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.4 });
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref]);
  return inView;
}

type IllustrationProps = React.ComponentProps<'div'>;

/**
 * The frame every illustration draws in: a 4:3 stage that fills its container and scales with its width, so one
 * em is 1/32 of the stage and every size inside is written in em. It is decoration, hidden from assistive technology.
 */
function Stage({ className, children, ...props }: IllustrationProps) {
  return (
    <div data-slot="illustration" aria-hidden className={cn('@container w-full', className)} {...props}>
      <div className="relative aspect-[4/3] w-full overflow-hidden text-[3.125cqw]">{children}</div>
    </div>
  );
}

const bar = 'h-[0.9em] rounded-full bg-muted';

type LayerStackIllustrationProps = IllustrationProps & {
  /** What fans the layers out: the stack scrolling into view, or the pointer over it. */
  trigger?: 'view' | 'hover';
};

/**
 * Four cards stacked like pages. They fan out once the stack is on screen, or while the pointer is over it, and
 * close again when it leaves. Under reduced motion they stand fanned out and do not move.
 */
function LayerStackIllustration({ trigger = 'view', ...props }: LayerStackIllustrationProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const inView = useInView(ref);
  const [hovered, setHovered] = React.useState(false);
  const fanned = reduced || (trigger === 'view' ? inView : hovered);

  return (
    <Stage
      ref={ref}
      onPointerEnter={(event) => event.pointerType !== 'touch' && setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      {...props}
    >
      {[3, 2, 1, 0].map((depth) => (
        <div
          key={depth}
          data-fanned={fanned ? '' : undefined}
          style={{ '--depth': depth } as React.CSSProperties}
          className={cn(
            'absolute top-[12em] left-[5em] flex h-[9em] w-[22em] items-center gap-[1.5em] rounded-[1.6em] border border-transparent bg-card px-[1.8em] shadow-card',
            '[scale:calc(1_-_var(--depth)_*_0.06)] translate-y-[calc(var(--depth)_*_-1em)] data-fanned:translate-y-[calc(var(--depth)_*_-3.4em)]',
            'motion-safe:transition-[translate] motion-safe:duration-slow motion-safe:ease-smooth-in-out',
          )}
        >
          <span className="size-[4em] shrink-0 rounded-[1.2em] bg-muted" />
          <span className="flex flex-1 flex-col gap-[0.9em]">
            <span className={cn(bar, 'w-3/4')} />
            <span className={cn(bar, 'w-1/2')} />
          </span>
        </div>
      ))}
    </Stage>
  );
}

const syncNodes = [
  { Icon: Database, position: 'left-[2.5em]' },
  { Icon: RefreshCw, position: 'left-[12.5em]' },
  { Icon: Server, position: 'left-[22.5em]' },
];

const syncPaths = ['M70 120 H125', 'M195 120 H250'];

/**
 * Three nodes on one line, with a pulse running along each link from left to right, one after the other.
 * The pulses run while the illustration is on screen and rest mid-link under reduced motion.
 */
function SyncIllustration(props: IllustrationProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const svgRef = React.useRef<SVGSVGElement>(null);
  const reduced = useReducedMotion();
  const inView = useInView(ref);

  React.useEffect(() => {
    const svg = svgRef.current;
    if (!svg || reduced) return;
    if (inView) svg.unpauseAnimations();
    else svg.pauseAnimations();
  }, [inView, reduced]);

  return (
    <Stage ref={ref} {...props}>
      <svg ref={svgRef} viewBox="0 0 320 240" className="absolute inset-0 size-full">
        {syncPaths.map((path, index) => (
          <g key={path}>
            <path d={path} fill="none" strokeWidth={1} vectorEffect="non-scaling-stroke" className="stroke-border" />
            {reduced ? (
              <circle cx={index === 0 ? 97.5 : 222.5} cy={120} r={3} className="fill-foreground" />
            ) : (
              <circle r={3} className="fill-foreground" opacity={0}>
                <animateMotion
                  path={path}
                  dur="2.4s"
                  begin={`${index * 1.2}s`}
                  repeatCount="indefinite"
                  calcMode="spline"
                  keyTimes="0;1"
                  keySplines="0.5 0 0.5 1"
                />
                <animate
                  attributeName="opacity"
                  values="0;1;1;0"
                  keyTimes="0;0.15;0.85;1"
                  dur="2.4s"
                  begin={`${index * 1.2}s`}
                  repeatCount="indefinite"
                />
              </circle>
            )}
          </g>
        ))}
      </svg>
      {syncNodes.map(({ Icon, position }) => (
        <div
          key={position}
          className={cn(
            'absolute top-[8.5em] flex size-[7em] items-center justify-center rounded-[1.8em] border border-transparent bg-card shadow-card',
            position,
          )}
        >
          <Icon className="size-[3em] text-muted-foreground" strokeWidth={1.75} />
        </div>
      ))}
    </Stage>
  );
}

const stepInterval = 800;
const holdSteps = 3;
const rowWidths = ['w-3/4', 'w-2/3', 'w-4/5', 'w-1/2'];

/**
 * A card with a progress bar and four rows that tick one after the other, hold for a moment, then clear and run
 * again. It runs while on screen. Under reduced motion every row stands ticked.
 */
function ChecklistIllustration(props: IllustrationProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const inView = useInView(ref);
  const [step, setStep] = React.useState(0);
  const total = rowWidths.length;
  const ticked = reduced ? total : Math.min(step, total);

  React.useEffect(() => {
    if (!inView || reduced) return;
    const timer = setInterval(() => setStep((current) => (current >= total + holdSteps ? 0 : current + 1)), stepInterval);
    return () => clearInterval(timer);
  }, [inView, reduced, total]);

  return (
    <Stage ref={ref} {...props}>
      <div className="absolute top-[2em] left-[5em] flex w-[22em] flex-col gap-[1.3em] rounded-[1.6em] border border-transparent bg-card p-[1.8em] shadow-card">
        <div className="h-[0.7em] overflow-hidden rounded-full bg-muted shadow-inset">
          <div
            style={{ '--progress': ticked / total } as React.CSSProperties}
            className="size-full origin-left [scale:var(--progress)_1] rounded-full bg-primary motion-safe:transition-[scale] motion-safe:duration-slow motion-safe:ease-power3-out"
          />
        </div>
        {rowWidths.map((width, index) => {
          const done = index < ticked;
          return (
            <div key={width} className="flex items-center gap-[1.4em]">
              <span
                data-done={done ? '' : undefined}
                className="flex size-[2.6em] shrink-0 items-center justify-center rounded-full border border-transparent bg-secondary text-primary-foreground shadow-control motion-safe:transition-[background-color,box-shadow] motion-safe:duration-fast data-done:bg-primary data-done:shadow-primary"
              >
                <Check
                  strokeWidth={3}
                  className={cn(
                    'size-[1.5em] motion-safe:transition-[opacity,scale] motion-safe:duration-fast motion-safe:ease-power3-out',
                    done ? 'opacity-100 [scale:1]' : 'opacity-0 [scale:0.8]',
                  )}
                />
              </span>
              <span className={cn(bar, width, 'motion-safe:transition-[opacity] motion-safe:duration-base', done && 'opacity-50')} />
            </div>
          );
        })}
      </div>
    </Stage>
  );
}

export { ChecklistIllustration, type IllustrationProps, LayerStackIllustration, type LayerStackIllustrationProps, SyncIllustration };
