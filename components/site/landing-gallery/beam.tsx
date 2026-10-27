'use client';

import { AppWindow } from 'lucide-react';
import { useEffect, useRef, type ComponentType, type SVGProps } from 'react';
import { KosmosMark } from '@/components/site/kosmos-mark';
import { BaseUiIcon, ReactIcon, TailwindIcon } from '@/components/site/brand-icons';
import { usePrefersReducedMotion } from './stage';

// The drawing sits in a 400 by 250 box (8:5, like the stage), and the nodes are placed in percent of the same box.
type Node = { x: number; y: number; label: string; Icon: ComponentType<SVGProps<SVGSVGElement>> };

const hub = { x: 200, y: 125 };
const app: Node = { x: 340, y: 125, label: 'Your app', Icon: AppWindow };
const sources: Node[] = [
  { x: 60, y: 50, label: 'Base UI', Icon: BaseUiIcon },
  { x: 60, y: 125, label: 'Tailwind CSS', Icon: TailwindIcon },
  { x: 60, y: 200, label: 'React', Icon: ReactIcon },
];

const curve = (from: { x: number; y: number }, to: { x: number; y: number }) => {
  const bend = (to.x - from.x) / 2;
  return `M${from.x},${from.y} C${from.x + bend},${from.y} ${to.x - bend},${to.y} ${to.x},${to.y}`;
};

const beams = [...sources.map((source, index) => ({ d: curve(source, hub), begin: index * 0.25 })), { d: curve(hub, app), begin: 1.1 }];

const place = (node: { x: number; y: number }) => ({ '--x': `${node.x / 4}%`, '--y': `${node.y / 2.5}%` }) as React.CSSProperties;

function BeamNode({ node }: { node: Node }) {
  return (
    <span
      title={node.label}
      style={place(node)}
      className="absolute start-(--x) top-(--y) grid size-10 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-transparent bg-card text-foreground shadow-card rtl:translate-x-1/2"
    >
      <node.Icon className="size-5" aria-hidden />
    </span>
  );
}

export function IntegrationBeam() {
  const svg = useRef<SVGSVGElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const element = svg.current;
    if (!element || reduced) return;
    const view = new IntersectionObserver(([entry]) => (entry.isIntersecting ? element.unpauseAnimations() : element.pauseAnimations()));
    view.observe(element);
    return () => view.disconnect();
  }, [reduced]);

  return (
    <div className="relative aspect-[8/5] w-full">
      <svg ref={svg} viewBox="0 0 400 250" fill="none" aria-hidden className="absolute inset-0 size-full rtl:-scale-x-100">
        {beams.map((beam) => (
          <g key={beam.d}>
            <path d={beam.d} className="stroke-border" strokeWidth="1.5" />
            {!reduced && (
              <path d={beam.d} pathLength={1} className="stroke-accent-text" strokeWidth="2" strokeLinecap="round" strokeDasharray="0.22 1.22" strokeDashoffset="0.22">
                <animate
                  attributeName="stroke-dashoffset"
                  values="0.22;-1"
                  dur="2.6s"
                  begin={`${beam.begin}s`}
                  repeatCount="indefinite"
                  calcMode="spline"
                  keyTimes="0;1"
                  keySplines="0.65 0 0.35 1"
                />
              </path>
            )}
          </g>
        ))}
      </svg>
      {sources.map((source) => (
        <BeamNode key={source.label} node={source} />
      ))}
      <span
        title="Kosmos UI"
        style={place(hub)}
        className="absolute start-(--x) top-(--y) grid size-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-transparent bg-card text-foreground shadow-card rtl:translate-x-1/2"
      >
        <KosmosMark className="size-9" gapColor="var(--color-card)" />
      </span>
      <BeamNode node={app} />
    </div>
  );
}
