'use client';

import * as React from 'react';
import { cn } from '@/registry/kosmos/lib/cn';

type FlickeringGridProps = React.ComponentProps<'div'> & {
  /** The side of each square, in pixels. */
  squareSize?: number;
  /** The space between squares, in pixels. */
  gap?: number;
  /** How often a square changes, per square per second. */
  flickerRate?: number;
  /** The strongest a square gets, from 0 to 1. */
  maxOpacity?: number;
  /** Squares near the pointer brighten in a soft halo while the rest keeps flickering. Not on touch or under reduced motion. */
  spotlight?: boolean;
  /** How far the halo reaches from the pointer, in pixels. */
  spotlightRadius?: number;
  /** How bright a square is at the center of the halo, from 0 to 1. */
  spotlightOpacity?: number;
};

function useReducedMotion() {
  return React.useSyncExternalStore(
    (notify) => {
      const list = window.matchMedia('(prefers-reduced-motion: reduce)');
      list.addEventListener('change', notify);
      return () => list.removeEventListener('change', notify);
    },
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    () => false,
  );
}

/** How fast the halo follows the pointer and fades in and out, in seconds. */
const haloEasing = 0.12;

type Cells = [firstCol: number, lastCol: number, firstRow: number, lastRow: number];

/**
 * A grid of small squares that flicker, as a background. Squares take the accent color (ink when the preset sets no
 * accent). It fills the nearest positioned parent, pauses while off screen and while the tab is hidden, shows a still grid
 * when the visitor asks for less motion, and is hidden from assistive technology. With `spotlight`, squares near a mouse
 * or pen pointer over the parent brighten in a soft halo that follows it. A frame redraws only the squares that changed.
 */
function FlickeringGrid({
  squareSize = 3,
  gap = 8,
  flickerRate = 0.3,
  maxOpacity = 0.14,
  spotlight = false,
  spotlightRadius = 160,
  spotlightOpacity = 0.5,
  className,
  ...props
}: FlickeringGridProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const reducedMotion = useReducedMotion();

  React.useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!container || !canvas || !context) return;

    const pitch = squareSize + gap;
    let cols = 0;
    let rows = 0;
    let scale = 1;
    let squares = new Float32Array(0);
    let color = '';
    let visible = false;
    let frame = 0;
    let last = 0;

    // The halo: where it is and how strong, easing toward the pointer. `touched` is the squares it covered last frame.
    const pointer = { x: 0, y: 0, inside: false };
    const halo = { x: 0, y: 0, strength: 0 };
    let touched: Cells | null = null;
    const haloOn = spotlight && !reducedMotion && window.matchMedia('(pointer: fine) and (hover: hover)').matches;

    const readColor = () => {
      color = getComputedStyle(container).color;
    };
    const stillOpacity = (index: number) => maxOpacity * (0.25 + (0.5 * ((index * 7919) % 13)) / 12);

    const alphaOf = (col: number, row: number) => {
      const base = squares[col * rows + row];
      if (halo.strength === 0) return base;
      const reach = 1 - Math.hypot((col + 0.5) * pitch - halo.x, (row + 0.5) * pitch - halo.y) / spotlightRadius;
      if (reach <= 0) return base;
      return base + (Math.max(spotlightOpacity, base) - base) * reach * reach * halo.strength;
    };
    const paint = (col: number, row: number) => {
      const x = Math.round(col * pitch * scale);
      const y = Math.round(row * pitch * scale);
      const size = Math.round(squareSize * scale);
      context.clearRect(x, y, size, size);
      context.globalAlpha = alphaOf(col, row);
      context.fillRect(x, y, size, size);
    };
    const paintCells = ([firstCol, lastCol, firstRow, lastRow]: Cells) => {
      for (let col = firstCol; col <= lastCol; col += 1) {
        for (let row = firstRow; row <= lastRow; row += 1) paint(col, row);
      }
    };
    const cellsAround = (x: number, y: number): Cells => [
      Math.max(0, Math.floor((x - spotlightRadius) / pitch)),
      Math.min(cols - 1, Math.ceil((x + spotlightRadius) / pitch)),
      Math.max(0, Math.floor((y - spotlightRadius) / pitch)),
      Math.min(rows - 1, Math.ceil((y + spotlightRadius) / pitch)),
    ];

    const drawAll = () => {
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.fillStyle = color;
      paintCells([0, cols - 1, 0, rows - 1]);
      context.globalAlpha = 1;
    };

    const resize = () => {
      const { clientWidth, clientHeight } = container;
      scale = window.devicePixelRatio || 1;
      canvas.width = Math.ceil(clientWidth * scale);
      canvas.height = Math.ceil(clientHeight * scale);
      cols = Math.ceil(clientWidth / pitch);
      rows = Math.ceil(clientHeight / pitch);
      squares = Float32Array.from({ length: cols * rows }, (_, index) => (reducedMotion ? stillOpacity(index) : Math.random() * maxOpacity));
      touched = null;
      drawAll();
    };

    const tick = (time: number) => {
      const elapsed = Math.min((time - last) / 1000, 0.1);
      last = time;
      context.fillStyle = color;
      const chance = flickerRate * elapsed;
      for (let index = 0; index < squares.length; index += 1) {
        if (Math.random() < chance) {
          squares[index] = Math.random() * maxOpacity;
          paint(Math.floor(index / rows), index % rows);
        }
      }
      if (haloOn && (pointer.inside || halo.strength > 0)) {
        const ease = 1 - Math.exp(-elapsed / haloEasing);
        halo.x += (pointer.x - halo.x) * ease;
        halo.y += (pointer.y - halo.y) * ease;
        halo.strength += ((pointer.inside ? 1 : 0) - halo.strength) * ease;
        if (!pointer.inside && halo.strength < 0.01) halo.strength = 0;
        if (touched) paintCells(touched);
        touched = halo.strength === 0 ? null : cellsAround(halo.x, halo.y);
        if (touched) paintCells(touched);
      }
      context.globalAlpha = 1;
      frame = requestAnimationFrame(tick);
    };
    const start = () => {
      if (reducedMotion || !visible || document.hidden || frame) return;
      last = performance.now();
      frame = requestAnimationFrame(tick);
    };
    const stop = () => {
      cancelAnimationFrame(frame);
      frame = 0;
    };

    readColor();
    resize();

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start();
      else stop();
    });
    intersectionObserver.observe(container);
    const themeObserver = new MutationObserver(() => {
      readColor();
      drawAll();
    });
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'style'] });
    const onVisibility = () => {
      if (document.hidden) stop();
      else start();
    };
    document.addEventListener('visibilitychange', onVisibility);

    const parent = container.parentElement;
    const follow = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return;
      const rect = container.getBoundingClientRect();
      pointer.x = event.clientX - rect.left;
      pointer.y = event.clientY - rect.top;
      if (!pointer.inside) {
        pointer.inside = true;
        if (halo.strength === 0) {
          halo.x = pointer.x;
          halo.y = pointer.y;
        }
      }
    };
    const leave = () => {
      pointer.inside = false;
    };
    if (haloOn && parent) {
      parent.addEventListener('pointermove', follow, { passive: true });
      parent.addEventListener('pointerleave', leave);
    }

    return () => {
      stop();
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      themeObserver.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      parent?.removeEventListener('pointermove', follow);
      parent?.removeEventListener('pointerleave', leave);
    };
  }, [squareSize, gap, flickerRate, maxOpacity, spotlight, spotlightRadius, spotlightOpacity, reducedMotion]);

  return (
    <div
      ref={containerRef}
      data-slot="flickering-grid"
      aria-hidden="true"
      className={cn('pointer-events-none absolute inset-0 -z-10 overflow-hidden text-accent-text', className)}
      {...props}
    >
      <canvas ref={canvasRef} className="absolute inset-0 size-full" />
    </div>
  );
}

export { FlickeringGrid, type FlickeringGridProps };
