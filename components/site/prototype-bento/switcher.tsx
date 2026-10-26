'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

export type PrototypeVariant = { key: string; name: string };

/** Floating bottom bar that flips between prototype variants through `?variant=`. Throwaway: never ships. */
export function PrototypeSwitcher({ variants, current }: { variants: PrototypeVariant[]; current: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const index = Math.max(
    0,
    variants.findIndex((variant) => variant.key === current),
  );

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      if (target?.closest('input, textarea, [contenteditable], [role=tab], [role=combobox]')) return;
      if (event.key === 'ArrowLeft') go(-1);
      if (event.key === 'ArrowRight') go(1);
    }
    function go(step: number) {
      const next = variants[(index + step + variants.length) % variants.length];
      router.replace(`${pathname}?variant=${next.key}`, { scroll: false });
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [index, pathname, router, variants]);

  if (process.env.NODE_ENV === 'production') return null;

  function step(direction: number) {
    const next = variants[(index + direction + variants.length) % variants.length];
    router.replace(`${pathname}?variant=${next.key}`, { scroll: false });
  }

  return (
    <div
      data-prototype-switcher
      className="fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-1 rounded-full bg-foreground p-1 text-background shadow-popover"
    >
      <button type="button" aria-label="Previous variant" onClick={() => step(-1)} className="grid size-8 place-items-center rounded-full hover:bg-background/15">
        <ChevronLeft aria-hidden className="size-4" />
      </button>
      <span className="min-w-44 px-2 text-center text-small font-medium whitespace-nowrap">
        {variants[index].key} ({variants[index].name})
      </span>
      <button type="button" aria-label="Next variant" onClick={() => step(1)} className="grid size-8 place-items-center rounded-full hover:bg-background/15">
        <ChevronRight aria-hidden className="size-4" />
      </button>
    </div>
  );
}
