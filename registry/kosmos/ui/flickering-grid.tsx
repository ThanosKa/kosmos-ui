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

/**
 * A grid of small squares that flicker, as a background. Squares take the accent colour (ink when the preset sets no
 * accent). It fills the nearest positioned parent, pauses while off screen and while the tab is hidden, shows a still grid
 * when the visitor asks for less motion, and is hidden from assistive technology.
 */
function FlickeringGrid({ squareSize = 3, gap = 8, flickerRate = 0.3, maxOpacity = 0.14, className, ...props }: FlickeringGridProps) {
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

    const readColor = () => {
      color = getComputedStyle(container).color;
    };
    const stillOpacity = (index: number) => maxOpacity * (0.25 + (0.5 * ((index * 7919) % 13)) / 12);

    const draw = () => {
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.fillStyle = color;
      for (let col = 0; col < cols; col += 1) {
        for (let row = 0; row < rows; row += 1) {
          context.globalAlpha = squares[col * rows + row];
          context.fillRect(col * pitch * scale, row * pitch * scale, squareSize * scale, squareSize * scale);
        }
      }
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
      draw();
    };

    const tick = (time: number) => {
      const elapsed = Math.min((time - last) / 1000, 0.1);
      last = time;
      for (let index = 0; index < squares.length; index += 1) {
        if (Math.random() < flickerRate * elapsed) squares[index] = Math.random() * maxOpacity;
      }
      draw();
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
      draw();
    });
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'style'] });
    const onVisibility = () => {
      if (document.hidden) stop();
      else start();
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      stop();
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      themeObserver.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [squareSize, gap, flickerRate, maxOpacity, reducedMotion]);

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
